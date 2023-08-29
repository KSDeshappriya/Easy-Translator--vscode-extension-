// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode');
const { translate } = require('@vitalets/google-translate-api');
const tUnit = require('./scripts/proxy');

// This method is called when your extension is activated
function activate(context) {
    let disposable = vscode.commands.registerCommand('easy-translator.hi', (selectedLanguage) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText) {
            vscode.window.showInformationMessage('No text selected.');
            return;
        }

        if (!selectedLanguage) {
            return;
        }

        const targetLanguage = selectedLanguage;

        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Translating...',
                cancellable: false
            },
            // eslint-disable-next-line no-unused-vars
            async (progress) => {
                try {
                    const result = await translate(selectedText, { to: targetLanguage });
                    const translatedText = result.text;
                    editor.edit((builder) => builder.replace(editor.selection, translatedText));
                    // vscode.window.showInformationMessage(`Translated text: ${translatedText}`);
                } catch (error) {
                    if (error.name == "TooManyRequestsError") {
                        const result = await tUnit.translateWithRetry(selectedText, targetLanguage);
                        const translatedText = result.text;
                        editor.edit((builder) => builder.replace(editor.selection, translatedText));
                    }
                    vscode.window.showErrorMessage(`Translation error: ${error.message}`);
                }
            }
        );
    });

    // textBox
    vscode.commands.registerCommand('easy-translator.showInputBox', () => {
        // Show an input box to the user
        vscode.window.showInputBox({
            prompt: 'Enter your Language Code',
            placeHolder: 'like as for English: en'
        }).then((userInput) => {
            let uLang = userInput;
            vscode.commands.executeCommand('easy-translator.hi', uLang);
        });
    });

    context.subscriptions.push(disposable);

    // selecting
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('*', {
            provideHover() {
                // Check if there's selected text
                const selection = vscode.window.activeTextEditor.selection;
                if (selection.isEmpty) {
                    return null;
                }

                // Update the MarkdownString content with the selected text and command link
                let myContent = new vscode.MarkdownString(`🌏
                [Sinhala](command:easy-translator.hi?${encodeURIComponent(JSON.stringify("si"))}) |
                [English](command:easy-translator.hi?${encodeURIComponent(JSON.stringify("en"))}) |
                [Tamil](command:easy-translator.hi?${encodeURIComponent(JSON.stringify("ta"))}) |
                [Other..](command:easy-translator.showInputBox)`);
                myContent.isTrusted = true;

                // Create a hover with the updated MarkdownString content
                let myHover = new vscode.Hover(myContent);

                return myHover;
            },
        })
    );
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}
