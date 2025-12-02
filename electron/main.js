const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let nextServer = null;

function startNextStandalone() {
    const root = app.isPackaged
        ? path.join(process.resourcesPath, "app")
        : path.join(__dirname, "..");

    const serverPath = path.join(root, ".next", "standalone", "server.js");

    console.log("[Electron] Ejecutando Next server:", serverPath);

    nextServer = spawn(
        process.execPath,
        [serverPath],
        {
            cwd: root,
            env: {
                ...process.env,
                PORT: "3000",
                NODE_ENV: "production",
            }
        }
    );

    nextServer.stdout.on("data", d => console.log("[next]", d.toString()));
    nextServer.stderr.on("data", d => console.error("[next error]", d.toString()));
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            sandbox: false,
        },
    });

    win.loadURL("http://localhost:3000");
}

app.whenReady().then(() => {
    startNextStandalone();
    setTimeout(() => createWindow(), 1500);
});

app.on("window-all-closed", () => {
    if (nextServer) nextServer.kill();
    if (process.platform !== "darwin") app.quit();
});
