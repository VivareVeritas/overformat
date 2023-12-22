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
        let currentIndents: number[] = [];
        let reachedRule: boolean = false; //whether we have reached the rule or not
        let groupedLines: number[] = []; //lines that are grouped together (e.g. if statement)

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

          //reached rule
          if (trimmedLine.startsWith("rule")) {
            reachedRule = true;
          }

          console.log(
            i +
              ":" +
              "indentStack: " +
              indentStack[i] +
              " currentIndents: " +
              currentIndents[i] +
              " rule: " +
              reachedRule
          );

          // Replace current indentation with the desired indentation at specific point in indentStack
          let desiredIndent = calculateIndentation(indentStack[i]);

          // get the current range of space between the start of the line and the first non-whitespace character
          const range = new vscode.Range(
            new vscode.Position(i, 0),
            new vscode.Position(i, currentIndent)
          );

          //replace current indentation with desired indentation
          edits.push(vscode.TextEdit.replace(range, desiredIndent));
        }
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
  return "    ".repeat(indentLevel);
}

// This method is called when your extension is deactivated
export function deactivate() {}
