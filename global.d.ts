import { ConfigManager } from "@/ConfigManager";
import { ContextMenuExposed } from "@/types/contextMenu";
import { DialogExpose } from "@/types/dialog";
import { ToastExpose } from "@/types/toast";
import { HTMLWebviewTag } from "@/types/webview";
import { ExposedNode } from "./electron/preload";
import { IpcRenderer } from "electron/renderer";
import { App } from "vue";

declare module "vue" {
  interface ComponentCustomProperties {
    $toast: ToastExpose;
    $dialog: DialogExpose;
    $contextMenu: ContextMenuExposed;
    $config: ConfigManager;
  }
}

declare global {
  var app: {
    toast: ToastExpose;
    dialog: DialogExpose;
    contextMenu: ContextMenuExposed;
    config: ConfigManager;
  };
  var electron: typeof ExposedNode;
  var webview: HTMLWebviewTag;
  var ipcRenderer: IpcRenderer;
  var vue: App;
}
