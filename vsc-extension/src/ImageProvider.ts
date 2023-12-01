import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import { userName } from "./extension";
import { getImageUrl } from "./getImgUrl";

export class ImageProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public async resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "media")],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.postMessage({ type: "setup" });

    if (!userName) {
      webviewView.webview.postMessage({
        type: "error",
        value: "GitHubでログインしてください",
      });
    } else {
      const res = await getImageUrl("sugiyama");
      const imgUrl = await res.data;
      if (imgUrl) {
        webviewView.webview.postMessage({
          type: "imgUrl",
          value: imgUrl,
        });
      } else {
        webviewView.webview.postMessage({
          type: "error",
          value: "画像がありません",
        });
      }
    }

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
			</head>
      <body>
        <img id="imgUrl" width="150" />
        <div id="error"></div>
        <script>
          const vscode = acquireVsCodeApi();
          window.addEventListener("message", (event) => {
            const message = event.data;
            switch (message.type) {
              case "error": {
                const errorMessage = document.getElementById("error");
                errorMessage.innerText = message.value;
                break;
              }
              case "imgUrl": {
                const img = document.getElementById("imgUrl");
                img.src = message.value;
                break;
              }
            }
          });
        </script>
			</body>
			<script src="${scriptUri}">
      </script>
			</html>`;
  }
}
