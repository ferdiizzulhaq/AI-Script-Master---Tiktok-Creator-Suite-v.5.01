const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, 'icon.png'), // Optional: Add an icon if you have one
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#020617',
      symbolColor: '#ffffff',
      height: 40
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Required to load local files effectively in this simple wrapper
    },
  });

  // Check if we are in dev mode or production
  // If 'npm run start' is used, we might want to load the vite server URL if running,
  // but for simplicity in this package, we will load the index.html directly.
  // Note: Since the app uses esm.sh imports, an internet connection is required.
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});