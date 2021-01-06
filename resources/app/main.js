const electron = require('electron');

var {app, BrowserWindow, globalShortcut} = electron;

//Boiler-plate : Creating a new Window on load
app.on('ready', function(){
  const win = new BrowserWindow({frame : false, width : 1360, height : 768, webPreferences: {nodeIntegration: true, devTools: true, enableRemoteModule: true}});
  win.maximize();
  win.loadFile('index.html');

  win.webContents.on('new-window', (e, url) => {e.preventDefault();});
});
