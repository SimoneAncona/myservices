import { app, BrowserWindow, ipcMain } from 'electron';
import path from "path";

function createWindow() {
  const win = new BrowserWindow({ width: 1200, height: 800, titleBarStyle: 'hidden', titleBarOverlay: {
    color: "#00000000",
    symbolColor: "#8F8F8F",
    height: 10
  }, webPreferences: { preload: path.join(import.meta.dirname, '/preload.js') }});
  win.loadFile('dist/index.html');
  ipcMain.on('set-theme', (_, theme) => {
    win.setTitleBarOverlay({
      symbolColor: theme === 'dark' ? '#ffffff' : '#000000'
    });
  });
  win.webContents.openDevTools();
}
app.whenReady().then(createWindow);
