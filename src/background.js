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
let win = null
let tray = null  // 在外面创建tray变量，防止被自动删除，导致图标自动消失
async function createWindow() {
  let screenSize = screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  win = new BrowserWindow({
    x: screenSize.width - 400,
    y: screenSize.height - 400,
    width: 250,
    height: 250,
    frame: false,// 无边框
    transparent: true,  // 透明
    skipTaskbar: true, // 取消默认任务栏展示，后面initTrayIcon设置了右侧任务栏图标展示
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
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
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
  // win.setPosition(-100,0)  // 设置位置坐标
  win.setAlwaysOnTop(true);   // 窗口置顶
  win.on('ready-to-show',()=>{
    win.show();
  })
  // 当点击关闭按钮
  win.on('close', (e) => {
    e.preventDefault();  // 阻止退出程序
    win.hide();    // 隐藏主程序窗口
  })
}

function initTrayIcon () {
    // 创建任务栏图标
  tray = new Tray(path.join(__dirname,  './bundled/favicon.ico'))
  console.log("tray");
  // 自定义托盘图标的内容菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      // 点击退出菜单退出程序
      label: '退出', click: function () {
        console.log(123);
        win.destroy()
        app.quit()

      }
    }
  ])

  tray.setToolTip('demo')  // 设置鼠标指针在托盘图标上悬停时显示的文本
  tray.setContextMenu(contextMenu)  // 设置图标的内容菜单
  // 点击托盘图标，显示主窗口
  tray.on("click", () => {
    win.show();
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
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
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
  createWindow();
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

ipcMain.on("window-show", () => {
  win.show()
})