const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
    // api segura si la necesitas después
});
