const { ipcMain, BrowserWindow } = require('electron');

function setupPrintHandler() {
  ipcMain.on('print-to-pdf', (event, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const webContents = win.webContents;

    try {
      // Configure print options
      const printOptions = {
        silent: false,
        printBackground: true,
        deviceName: '',
        color: true,
        margins: {
          marginType: 'custom',
          top: 10,
          bottom: 10,
          left: 5,
          right: 5
        },
        landscape: false,
        pageSize: 'A4',
        ...options
      };

      // Print the window contents
      webContents.print(printOptions, (success, failureReason) => {
        if (!success) {
          console.error('Print failed:', failureReason);
          event.reply('print-error', failureReason);
        }
      });
    } catch (error) {
      console.error('Print error:', error);
      event.reply('print-error', error.message);
    }
  });
}

module.exports = { setupPrintHandler }; 