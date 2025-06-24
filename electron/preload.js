const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    printElderlyInfo: () => ipcRenderer.invoke('print-elderly-info'),
    onPrintData: (callback) => {
        // Đảm bảo loại bỏ listener cũ nếu có
        ipcRenderer.removeAllListeners('print-data');
        // Thêm listener mới
        ipcRenderer.on('print-data', (event, data) => callback(data));
    },
    printReady: () => ipcRenderer.invoke('print-ready'),
    
    // Backup/restore APIs
    selectBackupDirectory: () => ipcRenderer.invoke('select-backup-directory'),
    selectBackupFile: () => ipcRenderer.invoke('select-backup-file'),
    selectBackupFolder: () => ipcRenderer.invoke('select-backup-folder'),
    getBackupList: () => ipcRenderer.invoke('get-backup-list'),
    createBackup: (options) => ipcRenderer.invoke('create-backup', options),
    restoreBackup: (backupPath) => ipcRenderer.invoke('restore-backup', backupPath),
    deleteBackup: (backupPath) => ipcRenderer.invoke('delete-backup', backupPath),
    downloadBackup: (backupPath) => ipcRenderer.invoke('download-backup', backupPath)
});

// Expose electronAPI for compatibility
contextBridge.exposeInMainWorld('electronAPI', {
    selectBackupDirectory: () => ipcRenderer.invoke('select-backup-directory'),
    selectBackupFile: () => ipcRenderer.invoke('select-backup-file'),
    selectBackupFolder: () => ipcRenderer.invoke('select-backup-folder'),
    getBackupList: () => ipcRenderer.invoke('get-backup-list'),
    createBackup: (options) => ipcRenderer.invoke('create-backup', options),
    restoreBackup: (backupPath) => ipcRenderer.invoke('restore-backup', backupPath),
    deleteBackup: (backupPath) => ipcRenderer.invoke('delete-backup', backupPath),
    downloadBackup: (backupPath) => ipcRenderer.invoke('download-backup', backupPath)
}); 