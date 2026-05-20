// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { ipcRenderer, contextBridge } from "electron";

export const ExposedNode = {
  //scrape: (url: string) => ipcRenderer.invoke("scrape", url),
  openFolder: (path: string) => ipcRenderer.invoke("shell:open-folder", path),
  //downloadWebtoonImage: (url: string, title: string) => ipcRenderer.invoke("downloadWebtoonImage", url, title),
  //downloadManhuausImage: (title: string, data: string) => ipcRenderer.invoke("downloadManhuausImage", title, data),
  //fs: {
  //  existsSync: (path: string) => ipcRenderer.invoke("fs.existsSync", path),
  //  writeFileSync: (path: string, data: string) => ipcRenderer.invoke("fs.writeFileSync", path, data),
  //  mkdirSync: (path: string) => ipcRenderer.invoke("fs.mkdirSync", path),
  //  rmSync: (path: string) => ipcRenderer.invoke("fs.rmSync", path),
  //  readDir: (path: string, ext: string) => ipcRenderer.invoke("fs.readDir", path, ext),
  //  readdirSync: (path: string, options?: { withFileTypes?: boolean; recursive?: boolean }) => ipcRenderer.invoke("readdirSync", path, options),
  //},
  //openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
  ipcRenderer: ipcRenderer,
  loadScrapers: () => ipcRenderer.invoke("loadScrapers"),
  //getAppPath: (path: string) => ipcRenderer.invoke("getAppPath", path),
  //isPackaged: (): Promise<string> => ipcRenderer.invoke("app.isPackaged"),
  //JSON: {
  //  load: (path: string) => ipcRenderer.invoke("JSON.load", path),
  //  save: (path: string, data: string) => ipcRenderer.invoke("JSON.save", path, data),
  //},
} as const;

contextBridge.exposeInMainWorld("electron", ExposedNode);
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...
});
