const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('smvDesk', {
  load: () => ipcRenderer.invoke('load'),
  save: t => ipcRenderer.invoke('save', t),
  backupAs: (n, t) => ipcRenderer.invoke('backupAs', n, t),
  pickBackupFolder: () => ipcRenderer.invoke('pickFolder'),
  getBackupFolder: () => ipcRenderer.invoke('getFolder'),
  clearBackupFolder: () => ipcRenderer.invoke('clearFolder'),
  autoBackup: (n, t) => ipcRenderer.invoke('autoBackup', n, t),
  openDataFolder: () => ipcRenderer.invoke('openData'),
  getDataDir: () => ipcRenderer.invoke('getDataDir'),
  pickDataDir: () => ipcRenderer.invoke('pickDataDir'),
  useDataDir: d => ipcRenderer.invoke('useDataDir', d)
});
