# Icebear — Agent Guide

**Stack:** Electron + React + TypeScript + Vite (`electron-vite`) + Tailwind CSS v4  
**Phase:** Design / prototype — architecture/service boundaries are scaffolded, and the renderer now has a React object-storage explorer shell with centralized reducer state.

## Entrypoints (the 3 `electron-vite` targets)

| Target   | Entry file              | Output                     |
|----------|-------------------------|----------------------------|
| main     | `electron/main.ts`      | `out/main/`                |
| preload  | `electron/preload.ts`   | `out/preload/preload.cjs`  |
| renderer | `index.html` → `src/main.tsx` | `out/renderer/`       |

Preload is compiled to **CJS** (not ESM) — configured in `electron.vite.config.ts`.  
Renderer uses `@tailwindcss/vite` with Tailwind v4 `@import "tailwindcss"` syntax (no `tailwind.config.*`).

## Commands

| Command               | What it does                                          |
|-----------------------|-------------------------------------------------------|
| `npm run dev`         | Dev server with HMR                                   |
| `npm run build`       | `tsc --noEmit` (typecheck) then `electron-vite build` |
| `npm run preview`     | Preview a production build                            |
| `npm run test`        | `vitest run` (single run)                             |
| `npm run test:watch`  | `vitest` (watch mode)                                 |
| `npm run test:coverage` | `vitest run --coverage`                             |

`build` always runs `tsc --noEmit` first. If type errors fail the build, the actual `electron-vite build` never runs.

## Project structure

- `ARCHITECTURE.md` — project architecture, runtime boundaries, service responsibilities, and security/performance principles.
- `electron/` — main process, preload, IPC handlers, and privileged services.
- `electron/ipc/index.ts` — central `registerIpcHandlers()` entrypoint.
- `electron/ipc/storage.ipc.ts` — storage IPC channels.
- `electron/ipc/dataset.ipc.ts` — dataset detection/schema/preview IPC channels.
- `electron/ipc/query.ipc.ts` — query IPC channels.
- `electron/services/storage/` — S3-compatible storage client/service boundary.
- `electron/services/dataset/` — dataset format detection, schema inference, and preview boundary.
- `electron/services/query/` — DuckDB query service boundary.
- `electron/preload.ts` — exposes typed `window.electronAPI` via `contextBridge`.
- `src/` — renderer (React/TS). `src/main.tsx` is the renderer entry.
- `src/App.tsx` — renderer root; calls `useAppController()` and passes state/actions to `AppShell`.
- `src/app/` — renderer app state boundary: `appState.ts`, `appReducer.ts`, and `useAppController.ts`.
- `src/appTypes.ts` — renderer state/selection types and node ID helpers.
- `src/components/` — shared renderer shell and UI primitives.
- `src/features/` — renderer feature folders: `connections`, `object-browser`, `dataset-preview`, `query-editor`, and `workspace`.
- `src/vite-env.d.ts` — types `window.electronAPI` with the preload's `ElectronAPI` type.
- `vitest.config.ts` — vitest config with 2 projects: `main` (node env, `electron/**/*.test.ts`) and `renderer` (happy-dom env, `src/**/*.test.{ts,tsx}`).
- `public/` — static assets (`favicon.svg`, `icons.svg`).

## Architecture notes

- **contextIsolation: true** + **nodeIntegration: false** + **sandbox: false** — standard Electron security.
- IPC handler registration (`registerIpcHandlers`) is called once in `electron/main.ts`'s `app.whenReady`.
- Keep credentials, AWS SDK/S3 clients, DuckDB, filesystem access, and other privileged work out of the renderer.
- Add renderer-accessible functionality through preload + IPC only; keep IPC handlers small and delegate to `electron/services/*`.
- `window.electronAPI` currently exposes `ping`, `credentials`, `storage`, `dataset`, and `query` namespaces.
- Storage services use AWS SDK v3 for S3-compatible APIs; dataset/query services remain placeholders until parsing, DuckDB, caching, and credential storage are added.
- **Testing:** Tests are co-located next to source files. Renderer tests use `happy-dom` environment. Tests that import `electron` (e.g. `preload.test.ts`, IPC handler tests) must mock it with `vi.mock('electron')` at file scope. Use `vi.resetModules()` + dynamic `import()` to test module init side effects (e.g. `contextBridge.exposeInMainWorld`).
- Renderer state is centralized in `src/app/useAppController.ts` using `useReducer(appReducer, initialState)`; avoid introducing global state libraries unless the app outgrows this controller/reducer pattern.
- Renderer data loading is event-driven through preload IPC (`window.electronAPI`). Components should receive data and callbacks via props; privileged storage/credential work must stay in Electron main/services.
- `AppShell` owns layout composition and routes by `state.selection` through `MainView`: `none` → `WelcomeView`, `connection` → `ConnectionDetail`, `bucket` → `BucketView`, `object` → `ObjectDetail`.
- Loaded buckets, object lists, metadata, loading flags, and errors are cached in `AppState` by connection IDs or generated node IDs from `src/appTypes.ts` (`objectListNodeId`, `objectNodeId`).
- Keep ephemeral component-only UI state local (example: sidebar filter text in `ConnectionsSidebar`). The connection modal currently uses uncontrolled form fields and converts them with `FormData` on save/test.
- When changing major boundaries or flow, update `ARCHITECTURE.md` as well.

## What's missing (not configured)

- No lint runner beyond `tsc` (no eslint, prettier)
- No CI workflows
- No pre-commit hooks
