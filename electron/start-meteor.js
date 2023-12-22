const { app } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const startMeteor = () => {
    const appPath = app.getAppPath();
    const isPackaged = app.isPackaged;

    const mainJsPath = isPackaged
        ? path.join(process.resourcesPath, 'app', 'bundle', 'main.js')
        : path.join(__dirname, 'bundle', 'main.js');

    if (!fs.existsSync(mainJsPath)) {
        console.error('main.js not found at', mainJsPath);
        process.exit(1);
    } else {
        console.log('main.js found, proceeding to spawn process');
    }

    const settingsPath = path.join(appPath, 'meteor-settings.json');

    // Define the path for the Node executable based on the platform and whether it's packaged
    let nodeExecutable;
    if (process.platform === 'darwin') {
        nodeExecutable = isPackaged
            ? path.join(process.resourcesPath, 'app', 'bin', 'node-v14.21.3-darwin-x64', 'bin', 'node')
            : path.join(__dirname, 'bin', 'node-v14.21.3-darwin-x64', 'bin', 'node');
    } else if (process.platform === 'win32') {
        nodeExecutable = isPackaged
            ? path.join(process.resourcesPath, 'app', 'bin', 'node-v14.21.3-win-x64', 'node.exe')
            : path.join(__dirname, 'bin', 'node-v14.21.3-win-x64', 'node.exe');
    } else {
        console.error('Unsupported platform:', process.platform);
        process.exit(1);
    }

    // Prepare environment variables
    const envVars = {
        ...process.env,
        ROOT_URL: 'http://localhost:3000',
        MONGO_URL: 'mongodb://127.0.0.1:27017/meteor',
        PORT: 3000,
        METEOR_SETTINGS: fs.readFileSync(settingsPath, 'utf8')
    };

    // Spawn the Meteor process
    const meteorProcess = spawn(nodeExecutable, [mainJsPath], { env: envVars });

    // Handle stdout and stderr
    meteorProcess.stdout.on('data', (data) => {
        console.log(`Meteor STDOUT: ${data}`);
    });

    meteorProcess.stderr.on('data', (data) => {
        console.error(`Meteor STDERR: ${data}`);
    });

    return meteorProcess;
};

module.exports = startMeteor;
