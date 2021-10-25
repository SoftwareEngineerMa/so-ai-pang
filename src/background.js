'use strict'

import { app, protocol, BrowserWindow, ipcMain, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
// const path = require('path')

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
let win = null;
let maze = null;
async function createMainWindow() {
  let screenSize = screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  win = new BrowserWindow({
    x: screenSize.width - 260,
    y: screenSize.height - 210,
    width: 250,
    height: 210,
    frame: false,// 无边框
    transparent: true,  // 透明
    webPreferences: {

      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      // preload: path.join(__dirname, 'preload.js'),
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }
  // win.setPosition(-100,0)  // 设置位置坐标
  // win.setAlwaysOnTop(true);   // 窗口置顶
}

function createMazeWindow() {
  let screenSize = screen.getPrimaryDisplay().workAreaSize;
  maze = new BrowserWindow({
    x: screenSize.width / 2,
    y: screenSize.height / 2,
    width: 700,
    height: 500,
    frame: true,// 无边框
    transparent: false,  // 透明
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      // preload: path.join(__dirname, 'preload.js'),
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true
    }
  })
  maze.loadURL('http://localhost:8080/maze.html');
  maze.on('closed',()=>{
        maze=null;
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createMainWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.on("window-min", () => {
  win.minimize()
})

ipcMain.on("maze-open", () => {
  createMazeWindow();
})

