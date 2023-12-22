import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let myFormattingProvider =
    vscode.languages.registerDocumentFormattingEditProvider("overpy", {
      provideDocumentFormattingEdits(
        document: vscode.TextDocument
      ): vscode.TextEdit[] {
        //define variables
        let edits: vscode.TextEdit[] = []; //edits that we will return to the editor to apply
        let indentStack: number[] = [0]; //current line being inspected for indentation
        let desiredIndent: string = ""; //desired indentation for the current line
        let reachedRule: boolean = false; //whether we have reached the rule or not

        //for each line - most logic should happen in here
        for (let i = 0; i < document.lineCount; i++) {
          // define constants, needs to be inside loop because references loop
          const line = document.lineAt(i);
          const trimmedLine = line.text.trimStart();
          const currentIndent = line.firstNonWhitespaceCharacterIndex;

          //check if we've reached rule
          if (reachedRule === false) {
            indentStack[indentStack.length - 1] = 0;
          } else {
            indentStack[indentStack.length - 1] = 1;
          }

          if (trimmedLine.startsWith("rule")) {
            reachedRule = true;
          }
          // // Adjust indentation level based on the keywords
          // if (startsWithKeyword(trimmedLine)) {
          //   indentStack[indentStack.length - 1]++;
          // } else if (startsWithElseOrElif(trimmedLine)) {
          //   indentStack[indentStack.length - 1]--;
          // } else if (i < document.lineCount - 1) {
          //   const nextLine = document.lineAt(i + 1);
          //   const nextIndent = nextLine.firstNonWhitespaceCharacterIndex;
          //   if (nextIndent < currentIndent) {
          //     indentStack[indentStack.length - 1]--;
          //   }
          // }

          // // Add colon at the end of the line if it contains a keyword and doesn't end with a colon
          // if (containsKeywordWithoutColon(trimmedLine)) {
          //   const position = new vscode.Position(i, line.text.length);
          //   edits.push(vscode.TextEdit.insert(position, ":"));
          // }

          // Replace current indentation with the desired indentation at specific point in indentStack
          let desiredIndent = calculateIndentation(
            indentStack[indentStack.length - 1]
          );

          // get the current range of space between the start of the line and the first non-whitespace character
          const range = new vscode.Range(
            new vscode.Position(i, 0),
            new vscode.Position(i, currentIndent)
          );

          //replace current indentation with desired indentation
          edits.push(vscode.TextEdit.replace(range, desiredIndent));
        }

        console.log("edits: " + edits);
        return edits;
      },
    });

  //push the changes we made in myFormattingProvider to the context
  context.subscriptions.push(myFormattingProvider);
}

//functions defined below:
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
