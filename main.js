const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path'), fs = require('fs');
const { createStore } = require('./store');

if (!app.requestSingleInstanceLock()) app.quit();
let win, store;

function createWindow() {
  win = new BrowserWindow({
    width: 1400, height: 900, title: 'SMV Operation Master', autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile('index.html');
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-prevent-unload', e => e.preventDefault());   // data is already saved on disk, so closing is safe
}

app.whenReady().then(() => {
  store = createStore(path.join(app.getPath('documents'), 'SMV Operation Master'));
  Menu.setApplicationMenu(null);
  ipcMain.handle('load', () => store.load());
  ipcMain.handle('save', (e, text) => store.save(text));
  ipcMain.handle('backupAs', async (e, name, text) => {
    const r = await dialog.showSaveDialog(win, { title: 'Save backup', defaultPath: path.join(app.getPath('documents'), name), filters: [{ name: 'Backup file', extensions: ['json'] }] });
    if (r.canceled || !r.filePath) return null;
    fs.writeFileSync(r.filePath, text, 'utf8'); return r.filePath;
  });
  ipcMain.handle('pickFolder', async () => {
    const r = await dialog.showOpenDialog(win, { title: 'Choose the folder for automatic backups', defaultPath: app.getPath('documents'), properties: ['openDirectory', 'createDirectory'] });
    if (r.canceled || !r.filePaths[0]) return null;
    return store.setFolder(r.filePaths[0]);
  });
  ipcMain.handle('getFolder', () => store.getFolder());
  ipcMain.handle('clearFolder', () => store.setFolder(null));
  ipcMain.handle('autoBackup', (e, name, text) => store.autoBackup(name, text));
  ipcMain.handle('openData', () => shell.openPath(store.root));
  createWindow();
});
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.on('window-all-closed', () => app.quit());
