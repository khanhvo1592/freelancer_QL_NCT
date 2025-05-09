const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    printElderlyInfo: () => ipcRenderer.invoke('print-elderly-info'),
    onPrintData: (callback) => {
        // Đảm bảo loại bỏ listener cũ nếu có
        ipcRenderer.removeAllListeners('print-data');
        // Thêm listener mới
        ipcRenderer.on('print-data', (event, data) => callback(data));
    },
    printReady: () => ipcRenderer.invoke('print-ready')
}); 