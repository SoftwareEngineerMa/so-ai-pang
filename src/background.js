'use strict'

import { app, protocol, BrowserWindow, ipcMain, screen, Tray, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path')

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
let win = null;
let maze = null;
let tray = null;
let guide = null;
async function createMainWindow() {
  let screenSize = screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  win = new BrowserWindow({
    x: screenSize.width - 400,
    y: screenSize.height - 400,
    width: 400,
    height: 400,
    frame: false,// 无边框
    transparent: true,  // 透明
    skipTaskbar: true, // 取消默认任务栏展示，后面initTrayIcon设置了右侧任务栏图标展示
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
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }
  // win.setPosition(-100,0)  // 设置位置坐标
  win.setAlwaysOnTop(true);   // 窗口置顶
  win.on('ready-to-show',() => {
    win.show();
  })
  // 当点击关闭按钮
  win.on('close', () => {
    // e.preventDefault();  // 阻止退出程序
    // win.hide();    // 隐藏主程序窗口
  })

  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, './Icon.icns'));
  }
}

function initTrayIcon () {
    // 创建任务栏图标
  tray = new Tray(path.join(__dirname,  './favicon.ico'))
  console.log("tray");
  // 自定义托盘图标的内容菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      // 点击退出菜单退出程序
      label: '退出', click: function () {
        win.destroy()
        app.quit()

      }
    }
  ])

  // tray.setToolTip('demo')  // 设置鼠标指针在托盘图标上悬停时显示的文本
  tray.setContextMenu(contextMenu)  // 设置图标的内容菜单
  // 点击托盘图标，显示主窗口
  tray.on("click", () => {
    win.show();
  })
}

function createMazeWindow() {
  let screenSize = screen.getPrimaryDisplay().workAreaSize;
  console.log(screenSize);
  maze = new BrowserWindow({
    x: screenSize.width * 0.1,
    y: screenSize.height * 0.1,
    width: screenSize.width * 0.9,
    height: screenSize.height * 1,
    frame: true,// 无边框
    transparent: false,  // 透明
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, './favicon.ico'),
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      // preload: path.join(__dirname, 'preload.js'),
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true
    }
  })
  maze.loadURL('app://./maze.html');
  // maze.loadURL('http://localhost:8080/maze.html');
  // if (!process.env.IS_TEST) maze.webContents.openDevTools()
  maze.on('closed',() => {
    maze=null;
    win.webContents.send('closedGame');
  })
}

function createGuideWindow() {
  let screenSize = screen.getPrimaryDisplay().workAreaSize;
  console.log(screenSize);
  console.log(screenSize.width * 0.5, screenSize.width * 0.3675);
  guide = new BrowserWindow({
    x: screenSize.width * 0.1,
    y: screenSize.height * 0.1,
    width: screenSize.width * 0.5,
    height: screenSize.width * 0.5,
    frame: false,// 无边框
    transparent: true,  // 透明
    skipTaskbar: true, // 取消默认任务栏展示，后面initTrayIcon设置了右侧任务栏图标展示
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      // preload: path.join(__dirname, 'preload.js'),
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true
    }
  })
  guide.loadURL('app://./guide.html');
  // guide.loadURL('http://localhost:8080/guide.html');
  // if (!process.env.IS_TEST) guide.webContents.openDevTools()
  guide.on('closed',() => {
    guide=null;
    win.webContents.send('closedGuide');
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
  createMainWindow();
  initTrayIcon();
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

ipcMain.on("gameHasOpenCamera", () => {
  win.webContents.send('gameHasOpenCamera');
})

ipcMain.on("guide-open", () => {
  createGuideWindow();
})

ipcMain.on("openCamera", () => {
  win.webContents.send('openCamera');
})

ipcMain.on("openGameCamera", () => {
  maze.webContents.send('openGameCamera');
})

ipcMain.on("closeGameCamera", () => {
  maze.webContents.send('closeGameCamera');
})

ipcMain.on("guide-close", () => {
  guide.close();
})




