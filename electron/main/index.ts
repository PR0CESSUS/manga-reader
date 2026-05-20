import { app, BrowserWindow, shell, ipcMain, WebContents, session } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { ElectronBlocker } from "@ghostery/adblocker-electron";
import { readFileSync } from "node:fs";
import { loadScrapers } from "./loadScrapers";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let blockerInitialized = false;
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

const ROOT_DIR = VITE_DEV_SERVER_URL ? process.env.APP_ROOT : path.dirname(app.getPath("exe"));

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

async function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Main window",
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
      webviewTag: true,
      webSecurity: true,
      sandbox: true,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "right", activate: true });
  } else {
    win.loadFile(indexHtml);
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  //win.webContents.on("did-finish-load", () => {
  //  win?.webContents.send("main-process-message", process.env.APP_ROOT);
  //});
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

app.on("web-contents-created", (event, webContents: WebContents) => {
  const filter = {
    urls: ["*://*.imgsrv4.com/*"],
  };
  webContents.on("will-attach-webview", (_wawevent, webPreferences, _params) => {
    //console.log("will-attach-webview");

    //win?.webContents.send("main-process-message", "appData:", app.getPath("appData"));
    //win?.webContents.send("main-process-message", "userData:", app.getPath("userData"));
    //win?.webContents.send("main-process-message", "process.env.APP_ROOT:", process.env.APP_ROOT);
    //win?.webContents.send("main-process-message", "app.getPath('exe'):", app.getPath("exe"));
    //win?.webContents.send("main-process-message", "TEST:", VITE_DEV_SERVER_URL ? process.env.APP_ROOT : app.getPath("exe"));

    //console.log(path.dirname(`C:\\Users\\rafae\\AppData\\Local\\Programs\\manga-reader\\manga-reader.exe`));
    webPreferences.preload = `${process.env.VITE_PUBLIC}\\webview.js`;
    if (blockerInitialized) return;
    ElectronBlocker.parse(readFileSync(`${VITE_DEV_SERVER_URL ? process.env.APP_ROOT : path.dirname(app.getPath("exe"))}\\easylist.txt`, "utf-8")).enableBlockingInSession(
      session.fromPartition("persist:webview"),
    );
    blockerInitialized = true;
  });
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

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});

ipcMain.handle("shell:open-folder", async (_, p: string) => {
  switch (p) {
    case "appData":
      return shell.openPath(ROOT_DIR);
    case "userData":
      return shell.openPath(app.getPath("userData"));

    default:
      return shell.openPath(p);
  }
});

ipcMain.handle("loadScrapers", () => loadScrapers(`${ROOT_DIR}\\data`));
