const { translate } = require('@vitalets/google-translate-api');
const createHttpProxyAgent = require('http-proxy-agent');
const fs = require('fs');

// Define a list of proxy servers with their respective ports.
let proxyList = [];
try {
    const proxyData = fs.readFileSync('./proxyList.json', 'utf8');
    const proxyConfig = JSON.parse(proxyData);
    proxyList = proxyConfig.proxies;
} catch (err) {
    console.error('Error reading external proxy list:', err);
}

let currentProxyIndex = 0;

async function getNextProxy() {
    // Get the next proxy URL from the list and rotate to the next one.
    const proxyUrl = proxyList[currentProxyIndex];
    currentProxyIndex = (currentProxyIndex + 1) % proxyList.length;
    return createHttpProxyAgent(proxyUrl);
}

async function translateWithRetry(textToTranslate, options, retryCount = 0) {
    try {
        const agent = await getNextProxy();

        const { text } = await translate(textToTranslate, {
            to: options,
            fetchOptions: { agent },
        });

        return text;
    } catch (e) {
        if (e.name === 'TooManyRequestsError' && retryCount < proxyList.length) {
            // Retry with another proxy agent.
            return translateWithRetry(textToTranslate, options, retryCount + 1);
        } else {
            throw e; // Rethrow other errors.
        }
    }
}

module.exports = {
    translateWithRetry
}