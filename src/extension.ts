import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let myFormattingProvider =
    vscode.languages.registerDocumentFormattingEditProvider("overpy", {
      provideDocumentFormattingEdits(
        document: vscode.TextDocument
      ): vscode.TextEdit[] {
        let edits: vscode.TextEdit[] = [];
        let indentStack: number[] = [0];

        for (let i = 0; i < document.lineCount; i++) {
          const line = document.lineAt(i);
          const trimmedLine = line.text.trimStart();
          const currentIndent = line.firstNonWhitespaceCharacterIndex;

          // Adjust indentation level based on the keywords
          if (startsWithKeyword(trimmedLine)) {
            indentStack[indentStack.length - 1]++;
          } else if (startsWithElseOrElif(trimmedLine)) {
            indentStack[indentStack.length - 1]--;
          } else if (i < document.lineCount - 1) {
            const nextLine = document.lineAt(i + 1);
            const nextIndent = nextLine.firstNonWhitespaceCharacterIndex;
            if (nextIndent < currentIndent) {
              indentStack[indentStack.length - 1]--;
            }
          }

          // Add colon at the end of the line if it contains a keyword and doesn't end with a colon
          // Add colon at the end of the line if it contains a keyword and doesn't end with a colon
          if (containsKeywordWithoutColon(trimmedLine)) {
            const position = new vscode.Position(i, line.text.length);
            edits.push(vscode.TextEdit.insert(position, ":"));
          }

          // Replace current indentation with the desired indentation
          let desiredIndent = calculateIndentation(
            indentStack[indentStack.length - 1]
          );
          const range = new vscode.Range(
            new vscode.Position(i, 0),
            new vscode.Position(i, currentIndent)
          );
          edits.push(vscode.TextEdit.replace(range, desiredIndent));
        }

        return edits;
      },
    });

  context.subscriptions.push(myFormattingProvider);
}

function startsWithKeyword(line: string): boolean {
  const keywords = ["if", "for", "while"];
  return keywords.some((keyword) => line.trimStart().startsWith(keyword));
}

function containsKeywordWithoutColon(line: string): boolean {
  const keywords = ["if", "for", "while"];
  return keywords.some(
    (keyword) => line.includes(keyword) && !line.trimEnd().endsWith(":")
  );
}

function startsWithElseOrElif(line: string): boolean {
  const keywords = ["else", "elif"];
  return keywords.some((keyword) => line.trimStart().startsWith(keyword));
}

function calculateIndentation(indentLevel: number): string {
  return "\t".repeat(indentLevel);
}

// This method is called when your extension is deactivated
export function deactivate() {}
