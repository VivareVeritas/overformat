"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
function activate(context) {
    let myFormattingProvider = vscode.languages.registerDocumentFormattingEditProvider("overpy", {
        provideDocumentFormattingEdits(document) {
            //define variables
            let edits = []; //edits that we will return to the editor to apply
            let indentStack = [0]; //current line being inspected for indentation
            let currentIndents = [];
            let reachedRule = false; //whether we have reached the rule or not
            let groupedLines = []; //lines that are grouped together (e.g. if statement)
            //for each line - most logic should happen in here
            for (let i = 0; i < document.lineCount; i++) {
                // define constants, needs to be inside loop because references loop
                const line = document.lineAt(i);
                const trimmedLine = line.text.trimStart();
                const currentIndent = line.firstNonWhitespaceCharacterIndex;
                const nextIndent = line.firstNonWhitespaceCharacterIndex;
                const currentIndentsRounded = Math.ceil(currentIndent / 4);
                currentIndents.push(currentIndentsRounded); // Store the current indentation level in the array
                //indents to 0 if not reached rule
                if (reachedRule === false) {
                    indentStack[i] = 0;
                }
                //indents to currentIndents if reached rule
                if (reachedRule) {
                    indentStack[i] = currentIndents[i];
                }
                //make sure nothing is on rule level
                if (currentIndent < 4 && reachedRule) {
                    indentStack[i] = 1;
                }
                if (startsWithKeyword(trimmedLine)) {
                }
                //reached rule
                if ((trimmedLine.startsWith("rule") || trimmedLine.startsWith("def")) &&
                    !trimmedLine.includes("PlayerVariables") &&
                    !trimmedLine.includes("GlobalVariables")) {
                    reachedRule = true;
                }
                console.log(i +
                    ":" +
                    "indentStack: " +
                    indentStack[i] +
                    " currentIndents: " +
                    currentIndents[i] +
                    " rule: " +
                    reachedRule);
                // Replace current indentation with the desired indentation at specific point in indentStack
                let desiredIndent = calculateIndentation(indentStack[i]);
                // get the current range of space between the start of the line and the first non-whitespace character
                const range = new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, currentIndent));
                if (startsWithKeyword(trimmedLine) &&
                    !trimmedLine.trimEnd().endsWith(":")) {
                    const range = new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, line.text.length));
                    edits.push(vscode.TextEdit.replace(range, `${line.text.trimEnd()}:`));
                }
                //replace current indentation with desired indentation
                edits.push(vscode.TextEdit.replace(range, desiredIndent));
            }
            return edits;
        },
    });
    //push the changes we made in myFormattingProvider to the context
    context.subscriptions.push(myFormattingProvider);
}
exports.activate = activate;
//functions defined below:
function startsWithKeyword(line) {
    const keywords = ["if", "for", "while", "else", "elif"];
    for (const keyword of keywords) {
        if (line.trimStart().startsWith(keyword)) {
            return true;
        }
    }
    return false;
}
function calculateIndentation(indentLevel) {
    return "    ".repeat(indentLevel);
}
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map