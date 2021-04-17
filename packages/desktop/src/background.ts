"use strict";
import path from "path";
import { promises as fs } from "fs";
import { lookup as mime } from "mime-types"
import { app, protocol, BrowserWindow } from "electron";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";

import { createServer } from "./server";
import {
  appDir,
  certPath,
  certKeyPath,
  initConfig,
  readConfig,
  initAccessKey,
} from "./config";
import { getCertFingerprint, initCert } from "./cert";
import { EventStore } from "@kickertech/common/store/EventStore";
const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // init config
  await fs.mkdir(appDir(), { recursive: true });
  await initConfig();
  await initCert();
  const accessKey = await initAccessKey();
  const fingerprint = await getCertFingerprint();
  const serverConfig = await readConfig();

  // pin local server certificate
  win.webContents.session.setCertificateVerifyProc(
    async (request, callback) => {
      if (fingerprint === request.certificate.fingerprint) {
        callback(0);
      } else {
        callback(-2);
      }
    }
  );

  // todo: possibly persist this to disk?
  const eventStore = new EventStore();

  await createServer(
    serverConfig,
    certPath,
    certKeyPath,
    accessKey,
    fingerprint,
    eventStore,
    win.webContents.send.bind(win.webContents)
  );

  protocol.registerBufferProtocol("asset", async (request, respond) => {
    console.log(request.url)
    let filePath = new URL(request.url).pathname;
    filePath = decodeURI(filePath);
    console.log(`loading: ${filePath}`);
    if (filePath == "") {
      respond({ mimeType: "text", data: `file '${filePath}' not found` });
      return;
    }
    // prevent directory traversal
    if (filePath.indexOf(appDir()) !== 0 ){
      respond({ mimeType: "text", data: `not allowed: file '${filePath}' not within ${appDir()}` });
      return;
    }
    let data: any;
    try {
      data = await fs.readFile(filePath);
    } catch (e) {
      console.error(`Failed to read ${filePath} on asset protocol`, e);
      respond({ mimeType: "text", data: `file ${filePath} not found` });
      return;
    }

    const mimeType = mime(filePath)
    respond({ mimeType, data });
  })

  // Load the index.html from `ASSETS_PATH` or relative to `__dirname`
  protocol.registerBufferProtocol("app", async (request, respond) => {
    let pathName = new URL(request.url).pathname;
    pathName = decodeURI(pathName);
    const loadPath = process.env.ASSETS_PATH || __dirname;
    const filePath = path.join(loadPath, pathName);
    console.log(`loading: ${filePath}`);
    let data: any;
    try {
      data = await fs.readFile(filePath);
    } catch (e) {
      console.error(`Failed to read ${pathName} on app protocol`, e);
      respond({ mimeType: "text", data: `file ${filePath} not found` });
      return;
    }

    const mimeType = mime(pathName)
    respond({ mimeType, data });
  });

  // use webpack dev server url or default to app:// protocol
  const url = process.env.WEBPACK_DEV_SERVER_URL || "app://./index.html";
  win.loadURL(url);
  win.webContents.on("did-fail-load", () => {
    win.loadURL(url);
  });

  if (process.env.DEBUG && !process.env.IS_TEST) {
    win.webContents.openDevTools();
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
