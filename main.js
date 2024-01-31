const { app, BrowserWindow } = require('electron')
const path = require('path')

///this is what sets up the window and generates the app.

//create a new window, assign the preload file, and load index.html.

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})