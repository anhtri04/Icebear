"use strict";
const electron = require("electron");
const electronAPI = {
  ping: () => electron.ipcRenderer.invoke("app:ping")
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
