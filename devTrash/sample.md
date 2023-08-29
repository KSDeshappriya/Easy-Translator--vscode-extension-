```javascript
const vscode = require('vscode');

function activate(context) {
    // Define a command that will be triggered when the link is clicked
    const myCommand = vscode.commands.registerCommand('extension.myCommand', (text) => {
        vscode.window.showInformationMessage(`Selected Text: ${text}`);
    });

    // Register the command
    context.subscriptions.push(myCommand);

    // Register a global hover provider
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('*', {
            provideHover(document) {
                // Check if there's selected text
                const selection = vscode.window.activeTextEditor.selection;
                if (selection.isEmpty) {
                    return null;
                }

                // Get the selected text
                const selectedText = document.getText(selection);

                // Update the MarkdownString content with the selected text and command link
                let myContent = new vscode.MarkdownString(`Selected Text: ${selectedText}\n[Click Me](command:extension.myCommand?${encodeURIComponent(JSON.stringify(selectedText))})`);
                myContent.isTrusted = true;

                // Create a hover with the updated MarkdownString content
                let myHover = new vscode.Hover(myContent);

                return myHover;
            },
        })
    );
}

exports.activate = activate;
```
-------------------------------------

```javascript
const vscode = require('vscode');

function activate(context) {
    // Define a command that will be triggered when the link is clicked
    const myCommand = vscode.commands.registerCommand('extension.myCommand', (text) => {
        vscode.window.showInformationMessage(`Selected Text: ${text}`);
    });

    vscode.commands.registerCommand('extension.showInputBox', () => {
        // Show an input box to the user
        vscode.window.showInputBox({
            prompt: 'Enter your Language Code',
            placeHolder: 'like as for English: en'
        }).then((userInput) => {
            // Handle the user's input
            if (userInput) {
                vscode.window.showInformationMessage(`You entered: ${userInput}`);
            } else {
                vscode.window.showWarningMessage('No input provided.');
            }
        });
    });

    // Register the command
    context.subscriptions.push(myCommand);

    // Register a global hover provider
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
                [Sinhala](command:extension.myCommand?${encodeURIComponent(JSON.stringify("si"))}) |
                [English](command:extension.myCommand?${encodeURIComponent(JSON.stringify("en"))}) |
                [Tamil](command:extension.myCommand?${encodeURIComponent(JSON.stringify("ta"))}) |
                [Other..](command:extension.showInputBox)`);
                myContent.isTrusted = true;

                // Create a hover with the updated MarkdownString content
                let myHover = new vscode.Hover(myContent);

                return myHover;
            },
        })
    );
}

exports.activate = activate;
```

--------------------

```json
"contributes": {
    "languages": [
        {
            "id": "your-language-id",
            "aliases": ["Your Language Name"],
            "extensions": [".your-language-extension"]
        }
    ]
}
```

