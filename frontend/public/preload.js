const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      send: (channel, data) => {
        // whitelist channels
        const validChannels = ['print-elderly', 'delete-elderly'];
        if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, data);
        }
      },
      on: (channel, func) => {
        const validChannels = ['print-complete', 'delete-complete'];
        if (validChannels.includes(channel)) {
          // Strip event as it includes `sender` 
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      },
      removeListener: (channel, func) => {
        const validChannels = ['print-complete', 'delete-complete'];
        if (validChannels.includes(channel)) {
          ipcRenderer.removeListener(channel, func);
        }
      }
    }
  }
); 