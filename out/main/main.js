import { ipcMain, app, BrowserWindow } from "electron";
import { join } from "node:path";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
function detectFormat(input) {
  const key = input.key.toLowerCase();
  const contentType = input.contentType?.toLowerCase() ?? "";
  if (key.endsWith(".parquet")) {
    return "parquet";
  }
  if (key.endsWith(".jsonl") || key.endsWith(".ndjson")) {
    return "jsonl";
  }
  if (key.endsWith(".json") || contentType.includes("application/json")) {
    return "json";
  }
  if (key.endsWith(".csv") || contentType.includes("text/csv")) {
    return "csv";
  }
  return "unknown";
}
function inferSchema(input) {
  const fields = /* @__PURE__ */ new Map();
  for (const row of input.sampleRows ?? []) {
    for (const [name, value] of Object.entries(row)) {
      const existing = fields.get(name);
      const type = inferFieldType(value);
      fields.set(name, {
        name,
        type: existing && existing.type !== type ? "unknown" : type,
        nullable: existing?.nullable ?? value === null
      });
    }
  }
  return {
    format: input.format,
    fields: Array.from(fields.values())
  };
}
function inferFieldType(value) {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  if (value instanceof Date) {
    return "date";
  }
  switch (typeof value) {
    case "string":
      return isIsoDate(value) ? "date" : "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "object":
      return "object";
    default:
      return "unknown";
  }
}
function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) && !Number.isNaN(Date.parse(value));
}
async function previewDataset(input) {
  return {
    bucket: input.bucket,
    key: input.key,
    format: detectFormat({ key: input.key, contentType: input.contentType }),
    columns: [],
    rows: [],
    limit: input.limit ?? 100
  };
}
function registerDatasetIpcHandlers() {
  ipcMain.handle("dataset:detectFormat", (_event, input) => {
    return detectFormat(input);
  });
  ipcMain.handle("dataset:inferSchema", (_event, input) => {
    return inferSchema(input);
  });
  ipcMain.handle("dataset:preview", (_event, input) => {
    return previewDataset(input);
  });
}
class DuckDbService {
  async runQuery(request) {
    const sql = request.sql.trim();
    if (!sql) {
      throw new Error("Query SQL is required");
    }
    return {
      columns: [],
      rows: [],
      rowCount: 0
    };
  }
}
const duckDbService = new DuckDbService();
function registerQueryIpcHandlers() {
  ipcMain.handle("query:run", (_event, request) => {
    return duckDbService.runQuery(request);
  });
}
function createS3Client(config) {
  return {
    provider: config.provider,
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle ?? config.provider === "minio"
  };
}
class StorageService {
  async listBuckets(connection) {
    createS3Client(connection);
    return [];
  }
  async listObjects(input) {
    createS3Client(input.connection);
    return {
      objects: [],
      prefixes: []
    };
  }
}
const storageService = new StorageService();
function registerStorageIpcHandlers() {
  ipcMain.handle("storage:listBuckets", (_event, connection) => {
    return storageService.listBuckets(connection);
  });
  ipcMain.handle("storage:listObjects", (_event, input) => {
    return storageService.listObjects(input);
  });
}
function registerIpcHandlers() {
  ipcMain.handle("app:ping", () => "pong");
  registerStorageIpcHandlers();
  registerDatasetIpcHandlers();
  registerQueryIpcHandlers();
}
const isMac = process.platform === "darwin";
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    void mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}
app.whenReady().then(() => {
  registerIpcHandlers();
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
