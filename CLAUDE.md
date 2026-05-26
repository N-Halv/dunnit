# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Dunnit is a todo-list app. It's a monorepo with two sibling projects:

- `fe-dunnit/` — React 19 + Vite frontend
- `be-dunnit/` — ASP.NET Core Web API on .NET 10, intended to sit on top of a SQL database (DB layer not yet wired up)

The two halves are independent projects with their own tooling; there is no root-level package manager or build orchestration. Work in the relevant subdirectory.

Both halves are currently at template-startup state: the backend exposes only the scaffolded `/weatherforecast` endpoint, and the frontend is the default Vite React template. Real domain code (lists, todo items, persistence) has not been added yet — when implementing features, expect to introduce the data model, persistence, and API surface from scratch rather than extending existing patterns.

## Common commands

### Frontend (`fe-dunnit/`)
- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build

### Backend (`be-dunnit/`)
- `dotnet run` — runs on `http://localhost:5235` (http profile, the default) or `https://localhost:7170` (https profile via `dotnet run --launch-profile https`)
- `dotnet build` — build the project
- OpenAPI is exposed in Development via `app.MapOpenApi()` (see `Program.cs`)
- `be-dunnit.http` contains sample requests usable from the VS Code REST Client / Rider HTTP client

## Architecture notes

- The backend mixes two endpoint styles: **MVC controllers** under `Controllers/` (e.g. `ConfigController`) registered via `AddControllers()`/`MapControllers()`, and **minimal API** routes declared inline in `Program.cs` (e.g. `/weatherforecast`). New endpoints should generally go in a controller; reserve minimal API for trivial one-offs.
- `RootNamespace` is `be_dunnit` (underscored) — match this when adding namespaced types. Controllers live in `be_dunnit.Controllers`.
- CORS allowed origins are read from `Cors:AllowedOrigins` in `IConfiguration` (set in `appsettings.Development.json`, overridable via env var `Cors__AllowedOrigins__0=...`). Don't hard-code origins in `Program.cs`.
- The frontend is plain JavaScript (not TypeScript) with ESLint flat config (`eslint.config.js`). On startup, `src/main.jsx` does a top-level `await fetch('http://localhost:5235/config')` before `createRoot(...).render(...)`, so the backend must be reachable for the app to render.
