const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let nextServer;
const isDev = !app.isPackaged;
const PORT = 3000;

function checkPort() {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();

        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false);
            }
        });

        server.once('listening', () => {
            server.close();
            resolve(true);
        });

        server.listen(PORT);
    });
}

function waitForNextServer(maxAttempts = 40) {
    return new Promise((resolve, reject) => {
        let attempts = 0;

        const checkServer = () => {
            const http = require('http');

            http.get(`http://localhost:${PORT}`, (res) => {
                if (res.statusCode === 200 || res.statusCode === 404) {
                    console.log('✓ Next.js server is ready!');
                    resolve();
                } else {
                    retryCheck();
                }
            }).on('error', () => {
                retryCheck();
            });
        };

        const retryCheck = () => {
            attempts++;
            if (attempts >= maxAttempts) {
                reject(new Error('Next.js server failed to start'));
            } else {
                console.log(`Waiting for Next.js server... (${attempts}/${maxAttempts})`);
                setTimeout(checkServer, 1000);
            }
        };

        checkServer();
    });
}

async function startNextServer() {
    if (isDev) {
        console.log('Development mode - assuming Next.js is already running');
        return;
    }

    console.log('Starting Next.js server in production...');

    const portAvailable = await checkPort();
    if (!portAvailable) {
        console.log('Port already in use, assuming server is running');
        return;
    }

    return new Promise((resolve, reject) => {
        const isWindows = process.platform === 'win32';

        // Ruta correcta para extraResources
        const appPath = path.join(process.resourcesPath, 'app');

        console.log('App path:', appPath);
        console.log('Resources path:', process.resourcesPath);

        const fs = require('fs');
        if (!fs.existsSync(appPath)) {
            const error = `App path no existe: ${appPath}`;
            console.error(error);
            dialog.showErrorBox('Error', error);
            reject(new Error(error));
            return;
        }

        // SOLUCIÓN: Ruta completa a next.cmd o node + next
        const nextBinPath = path.join(appPath, 'node_modules', '.bin', isWindows ? 'next.cmd' : 'next');
        const nextJsPath = path.join(appPath, 'node_modules', 'next', 'dist', 'bin', 'next');

        console.log('Next binary path:', nextBinPath);
        console.log('Next.js path:', nextJsPath);

        let command, args;

        // Usar node directamente con el script de Next.js
        if (isWindows) {
            command = 'node';
            args = [nextJsPath, 'start', '-p', PORT.toString()];
        } else {
            command = 'node';
            args = [nextJsPath, 'start', '-p', PORT.toString()];
        }

        console.log('Command:', command);
        console.log('Args:', args);

        nextServer = spawn(command, args, {
            cwd: appPath,
            env: {
                ...process.env,
                NODE_ENV: 'production',
                PORT: PORT.toString(),
                Path: process.env.Path // Importante en Windows
            },
            stdio: ['ignore', 'pipe', 'pipe']
        });

        let output = '';

        nextServer.stdout.on('data', (data) => {
            const msg = data.toString();
            output += msg;
            console.log('Next.js:', msg.trim());
        });

        nextServer.stderr.on('data', (data) => {
            const msg = data.toString();
            output += msg;
            console.error('Next.js Error:', msg.trim());
        });

        nextServer.on('error', (error) => {
            console.error('Failed to start Next.js:', error);
            dialog.showErrorBox(
                'Error',
                `No se pudo iniciar Next.js:\n${error.message}\n\nApp path: ${appPath}`
            );
            reject(error);
        });

        nextServer.on('close', (code) => {
            console.log(`Next.js process exited with code ${code}`);
            if (code !== 0 && code !== null) {
                dialog.showErrorBox(
                    'Error',
                    `Next.js se cerró con código ${code}\n\nSalida:\n${output.substring(0, 500)}`
                );
            }
        });

        waitForNextServer()
            .then(() => {
                console.log('Next.js server started successfully');
                resolve();
            })
            .catch((error) => {
                console.error('Error waiting for Next.js:', error);
                dialog.showErrorBox(
                    'Error al iniciar',
                    `No se pudo iniciar el servidor.\n\nDetalles:\n${output.substring(0, 500)}`
                );
                reject(error);
            });
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.loadURL(`http://localhost:${PORT}`);

    mainWindow.webContents.on('did-fail-load', () => {
        console.log('Failed to load, retrying...');
        setTimeout(() => {
            mainWindow.loadURL(`http://localhost:${PORT}`);
        }, 1000);
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    try {
        console.log('App is ready, starting Next.js server...');
        await startNextServer();
        console.log('Creating window...');
        createWindow();
    } catch (error) {
        console.error('Error during startup:', error);
        dialog.showErrorBox(
            'Error de inicio',
            'Hubo un problema al iniciar la aplicación. Por favor, contacte al soporte.'
        );
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    if (nextServer) {
        console.log('Killing Next.js server...');
        nextServer.kill('SIGTERM');
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (nextServer) {
        console.log('Shutting down Next.js server...');
        nextServer.kill('SIGTERM');
    }
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});