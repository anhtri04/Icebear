# Icebear — Agent Guide

**Stack:** Electron + React + TypeScript + Vite (`electron-vite`) + Tailwind CSS v4  
**Phase:** Design / prototype — the renderer is still a Vite boilerplate counter app.

## Entrypoints (the 3 `electron-vite` targets)

| Target   | Entry file              | Output                     |
|----------|-------------------------|----------------------------|
| main     | `electron/main.ts`      | `out/main/`                |
| preload  | `electron/preload.ts`   | `out/preload/preload.cjs`  |
| renderer | `index.html` → `src/main.ts` | `out/renderer/`        |

Preload is compiled to **CJS** (not ESM) — configured in `electron.vite.config.ts`.  
Renderer uses `@tailwindcss/vite` with Tailwind v4 `@import "tailwindcss"` syntax (no `tailwind.config.*`).

## Commands

| Command             | What it does                                    |
|---------------------|-------------------------------------------------|
| `npm run dev`       | Dev server with HMR                             |
| `npm run build`     | `tsc --noEmit` (typecheck) then `electron-vite build` |
| `npm run preview`   | Preview a production build                      |

`build` always runs `tsc --noEmit` first. If type errors fail the build, the actual `electron-vite build` never runs.

## Project structure

- `electron/` — main process + IPC handlers. `electron/ipc/index.ts` has `registerIpcHandlers()`.
- `electron/preload.ts` — exposes `window.electronAPI` via `contextBridge` (single `app:ping` handler).
- `src/` — renderer (React/TS). `src/main.ts` is the renderer entry.
- `src/vite-env.d.ts` — types `window.electronAPI` with the preload's `ElectronAPI` type.
- `public/` — static assets (`favicon.svg`, `icons.svg`).

## Architecture notes

- **contextIsolation: true** + **nodeIntegration: false** + **sandbox: false** — standard Electron security.
- IPC handler registration (`registerIpcHandlers`) is called once in `electron/main.ts`'s `app.whenReady`.
- The renderer currently has zero React components — it uses vanilla DOM manipulation (`src/counter.ts`).

## What's missing (not configured)

- No test framework (no `vitest`, jest, playwright, etc.)
- No lint runner beyond `tsc` (no eslint, prettier)
- No CI workflows
- No pre-commit hooks
