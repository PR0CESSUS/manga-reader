import { app, BrowserWindow, dialog, ipcMain, session, shell, WebContents } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readDir } from "./node/readDir";
import { ElectronBlocker } from "@ghostery/adblocker-electron";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) app.quit();

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
      webviewTag: true,
      webSecurity: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  //mainWindow.webContents.on("will-attach-webview", (e, webPreferences) => {
  //  //console.log(e, webPreferences);
  //  console.log("-------------------------------------");
  //  console.log(__dirname);
  //  console.log(path.join(__dirname, "../../assets/test.js"));

  //  webPreferences.preload = path.join(__dirname, "../../assets/test.js");
  //  //webPreferences.preload = "D:/Project/manga/assets/test.js";
  //  //webPreferences.preload = join(import.meta.dirname, "../preload/index.js");
  //});
  globalThis.mainWindow = mainWindow;

  //mainWindow.removeMenu();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on("ready", createWindow);

app.whenReady().then(() => {
  //ipcMain.handle("scrape", async (_event, url) => {
  //  let response = await axios.get(url, {
  //    headers: {
  //      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  //      "Accept-Language": "en-US,en;q=0.9",
  //    },
  //  });
  //  return response.data;
  //});

  //ipcMain.handle("downloadWebtoonImage", (_event, url, title) => downloadWebtoonImage(url, title));
  ipcMain.handle("writeFileImagePng", (_event, path, data) => {
    mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
    writeFileSync(path, Buffer.from(data, "base64"));
  });
  ipcMain.handle("dialog:openDirectory", handleFileOpen);
  ipcMain.handle("JSON.load", (_event, path) => (existsSync(path) ? JSON.parse(readFileSync(path).toString()) : null));
  ipcMain.handle("JSON.save", (_event, path, data) => {
    if (path.split("/").length > 1) mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
    writeFileSync(path, data);
  });
  ipcMain.handle("fs.readdirSync", (_event, path, options) => (existsSync(path) ? (readdirSync(path, options).length ? readdirSync(path, options) : null) : null));
  ipcMain.handle("fs.readDir", (_event, path, ext) => readDir(path, ext));
  ipcMain.handle("fs.existsSync", (_event, path) => existsSync(path));
  ipcMain.handle("fs.writeFileSync", (_event, path, data) => writeFileSync(path, data));
  ipcMain.handle("fs.mkdirSync", (_event, path) => mkdirSync(path, { recursive: true }));
  ipcMain.handle("fs.rmSync", (_event, path) => rmSync(path, { recursive: true }));
  //ipcMain.handle("dirname", () => __dirname);
  ipcMain.handle("app.isPackaged", (_event) => app.isPackaged);
  //  {
  //  if (app.isPackaged) {
  //    return path.normalize(path.join(path.dirname(app.getAppPath()), "../", p));
  //  } else {
  //    //console.log(p);
  //    //console.log("app.getAppPath()", app.getAppPath());
  //    //console.log(path.normalize(p));
  //    //console.log();

  //    return path.join(app.getAppPath(), path.normalize(p));
  //  }
  //});

  createWindow();
  //TODO Enable ElectronBlocker in produciton
  ElectronBlocker.parse(readFileSync("./public/easylist.txt", "utf-8")).enableBlockingInSession(session.defaultSession);

  app.on("web-contents-created", (event, webContents: WebContents) => {
    // Opcjonalnie: sprawdź czy to webview (możesz dodać dodatkowe warunki)
    webContents.on("did-attach-webview", () => {
      console.log("Webview attached - ustawiam CORS handler");
    });

    const filter = {
      urls: ["*://*.imgsrv4.com/*"],
    };

    // Przypisujemy handler do sesji tego konkretnego webContents
    webContents.session.webRequest.onHeadersReceived(filter, (details, callback) => {
      console.log("onHeadersReceived (webview):", details.url); // do debugowania

      const responseHeaders = details.responseHeaders || {};

      // Usuwamy stare nagłówki CORS
      delete responseHeaders["access-control-allow-origin"];
      delete responseHeaders["access-control-allow-credentials"];
      delete responseHeaders["Access-Control-Allow-Origin"];
      delete responseHeaders["Access-Control-Allow-Credentials"];

      // Dodajemy nasze
      responseHeaders["Access-Control-Allow-Origin"] = ["*"];
      responseHeaders["Access-Control-Allow-Credentials"] = ["true"];
      responseHeaders["Access-Control-Allow-Methods"] = ["GET, OPTIONS"];
      responseHeaders["Access-Control-Allow-Headers"] = ["*"];

      callback({ responseHeaders });
    });
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (!canceled) {
    return filePaths[0];
  }
}
