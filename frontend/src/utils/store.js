const Store = require('electron-store');

const store = new Store({
  defaults: {
    elderlyData: [],
    settings: {
      theme: 'light',
      language: 'vi',
    },
  },
});

export default store; 