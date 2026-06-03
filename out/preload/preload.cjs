"use strict";
const electron = require("electron");
const electronAPI = {
  ping: () => electron.ipcRenderer.invoke("app:ping"),
  storage: {
    listBuckets: (connection) => {
      return electron.ipcRenderer.invoke("storage:listBuckets", connection);
    },
    listObjects: (input) => {
      return electron.ipcRenderer.invoke("storage:listObjects", input);
    }
  },
  dataset: {
    detectFormat: (input) => {
      return electron.ipcRenderer.invoke("dataset:detectFormat", input);
    },
    inferSchema: (input) => {
      return electron.ipcRenderer.invoke("dataset:inferSchema", input);
    },
    preview: (input) => {
      return electron.ipcRenderer.invoke("dataset:preview", input);
    }
  },
  query: {
    run: (request) => {
      return electron.ipcRenderer.invoke("query:run", request);
    }
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
