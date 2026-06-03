# Icebear Architecture

Icebear is a local-first Electron desktop application for exploring object storage as queryable datasets. The architecture separates UI concerns from privileged storage access, dataset processing, and query execution.

## Goals

- Connect to Amazon S3, Cloudflare R2, MinIO, and other S3-compatible providers.
- Browse buckets, prefixes, and objects through a desktop UI.
- Treat JSON, JSONL, CSV, and Parquet objects as datasets rather than opaque files.
- Infer schemas, preview rows, inspect metadata, and run SQL or visual queries locally.
- Avoid deploying external backend services.

## High-level flow

```text
Connect -> Browse -> Detect Dataset -> Infer Schema -> Preview -> Query -> Analyze
```

## Runtime boundaries

```text
React Renderer
  -> typed preload API
Electron Main Process
  -> IPC handlers
Application Services
  -> credentials, storage, dataset, query modules
Adapters / Engines
  -> JSON credential store, S3-compatible APIs, DuckDB, local cache
```

### Renderer

The renderer owns presentation and user interaction only:

- connection forms
- object browser
- dataset preview table
- schema inspector
- SQL editor / visual query builder
- query results and progress states

The renderer must not directly access credentials, Node APIs, the AWS SDK, DuckDB, or local filesystem paths.

### Preload

The preload exposes a narrow typed API through `contextBridge` while keeping `contextIsolation: true` and `nodeIntegration: false`.

Expected API shape:

```ts
window.electronAPI.storage.listBuckets(...)
window.electronAPI.storage.listObjects(...)
window.electronAPI.dataset.detectFormat(...)
window.electronAPI.dataset.inferSchema(...)
window.electronAPI.dataset.preview(...)
window.electronAPI.query.run(...)
```

### Main process

The main process owns privileged operations and coordinates application services:

- IPC handler registration
- provider/client construction
- credential access and local credential persistence
- cache paths
- DuckDB orchestration
- future worker or utility-process delegation

Heavy parsing and query execution should eventually move out of the main thread into workers or Electron utility processes.

## Service layers

### Credential service

Located under `electron/services/credentials/`.

Responsibilities:

- store object storage connection profiles by ID
- normalize provider defaults for AWS S3, Cloudflare R2, MinIO, and generic S3-compatible services
- return redacted profiles to the renderer
- resolve full credentials for main-process services only

The current prototype stores credentials in a JSON file under Electron `userData`. Future versions should move secrets to OS-backed credential storage.

### Storage service

Located under `electron/services/storage/`.

Responsibilities:

- construct S3-compatible clients
- list buckets
- list objects by bucket/prefix
- inspect object metadata
- create object streams or ranged reads

The storage service uses AWS SDK v3 behind provider-neutral Icebear types. S3-compatible provider details should remain contained inside this service boundary.

### Dataset service

Located under `electron/services/dataset/`.

Responsibilities:

- detect dataset format from key/content type
- infer schemas from sampled rows or file metadata
- produce limited previews
- normalize supported formats into tabular data

Supported initial formats:

- CSV
- JSON
- JSONL
- Parquet

### Query service

Located under `electron/services/query/`.

Responsibilities:

- register local or remote datasets with DuckDB
- run SQL queries
- paginate results
- cancel long-running queries
- enforce memory/cache limits

DuckDB should be treated as the embedded analytical engine, not as UI state.

## IPC layout

```text
electron/ipc/
  index.ts         # central registration
  storage.ipc.ts   # storage channels
  dataset.ipc.ts   # dataset channels
  query.ipc.ts     # query channels
```

IPC handlers should be small adapters that validate inputs, call services, and return serializable results.

## Security principles

- Keep credentials out of the renderer.
- Never expose raw Node, filesystem, or AWS SDK objects through preload.
- Avoid logging secrets.
- Prefer OS-backed credential storage in future implementation.
- Validate all IPC input from the renderer.

## Performance principles

- Do not download full large objects for previews.
- Prefer sampling, streaming, pagination, and ranged reads.
- Cache schemas, metadata, sampled rows, and temporary downloads where useful.
- Provide progress and cancellation for long-running scans or queries.

## Current scaffold

The current implementation establishes the folders, typed service boundaries, and IPC channel names needed for the first prototype. Storage connectivity is implemented through AWS SDK v3 for S3-compatible APIs. Real file parsing, DuckDB integration, caching, and credential storage should be implemented within these boundaries.
