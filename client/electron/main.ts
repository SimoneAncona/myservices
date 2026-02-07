import { app, BrowserWindow } from 'electron';

function createWindow() {
  const win = new BrowserWindow({ width: 1200, height: 800, titleBarStyle: 'hidden', titleBarOverlay: {
    color: "#00000000",
    symbolColor: "#FFFFFF",
    height: 10
  } });
  win.loadFile('dist/index.html');
}

app.whenReady().then(createWindow);
