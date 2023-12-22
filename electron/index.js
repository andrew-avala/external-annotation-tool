const { app, BrowserWindow } = require('electron');
const startMeteor = require('./start-meteor.js');
const axios = require('axios');
let mainWindow;
let meteorProcess = null;

const serverUrl = 'http://127.0.0.1:3000';

const waitForMeteorToStart = (callback, retryInterval = 2000, maxRetries = 15) => {
    let retries = 0;
    const checkServer = () => {
        axios.get(serverUrl)
            .then(response => {
                if (response.status === 200) callback();
                else throw new Error('Server not ready');
            })
            .catch(error => {
                console.error('Error contacting server:', error.message);
                if (++retries < maxRetries) setTimeout(checkServer, retryInterval);
                else console.error('Meteor server did not start after maximum retries');
            });
    };
    checkServer();
};

function createWindow() {
    meteorProcess = startMeteor();

    waitForMeteorToStart(() => {
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            }
        });

        mainWindow.loadURL(serverUrl);
        mainWindow.webContents.openDevTools();

        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('will-quit', () => {
    if (meteorProcess) {
        meteorProcess.kill();
    }
});

