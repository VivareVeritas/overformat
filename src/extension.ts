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
          //! for each line until begins with "rule": set indent to 0
          //! for each line after "rule": if line is 0 indent, see if lineAt(i+1) is greater indent, if true then for each line until i+1 is less indent than i: add all lines to groupedLines array and increase the indent level of the whole group and clear the list
          //! if any i+1 has an indent of more than 1 in reference to i, for each line until i+1 is less indent than i: add all lines to groupedLines array and decrease increment of groupedLines by 1, clear groupedLines
          //! handle missing semicolons

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
  const keywords = ["if", "for", "while", "else", "elif"];
  return keywords.some((keyword) => line.trimStart().startsWith(keyword));
}

function calculateIndentation(indentLevel: number): string {
  return "\t".repeat(indentLevel);
}

// This method is called when your extension is deactivated
export function deactivate() {}
