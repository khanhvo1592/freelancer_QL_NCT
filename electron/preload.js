const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    printElderlyInfo: (data) => ipcRenderer.invoke('print-elderly-info', data)
}); 