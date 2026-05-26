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
- `npm run gen:api` — regenerate `src/api/schema.d.ts` from the backend's OpenAPI document. Runs `dotnet build` on `../be-dunnit` (which emits `be-dunnit.json` via the `Microsoft.Extensions.ApiDescription.Server` MSBuild target — no running backend needed) and then pipes it through `openapi-typescript`. Run this whenever a backend DTO or route signature changes.

### Backend (`be-dunnit/`)
- `dotnet run` — runs on `http://localhost:5999` (http profile, the default) or `https://localhost:7170` (https profile via `dotnet run --launch-profile https`)
- `dotnet build` — build the project
- OpenAPI is exposed in Development via `app.MapOpenApi()` (see `Program.cs`)
- `be-dunnit.http` contains sample requests usable from the VS Code REST Client / Rider HTTP client

## Architecture notes

- The backend mixes two endpoint styles: **MVC controllers** under `Controllers/` (e.g. `ConfigController`) registered via `AddControllers()`/`MapControllers()`, and **minimal API** routes declared inline in `Program.cs` (e.g. `/weatherforecast`). New endpoints should generally go in a controller; reserve minimal API for trivial one-offs.
- `RootNamespace` is `be_dunnit` (underscored) — match this when adding namespaced types. Controllers live in `be_dunnit.Controllers`.
- CORS allowed origins are read from `Cors:AllowedOrigins` in `IConfiguration` (set in `appsettings.Development.json`, overridable via env var `Cors__AllowedOrigins__0=...`). Don't hard-code origins in `Program.cs`.
- The frontend is **TypeScript** with `verbatimModuleSyntax` enabled — type-only imports must use `import type { ... }`. Build runs `tsc -b && vite build`. ESLint flat config in `eslint.config.js`.
- Frontend is organized **by feature** under `src/features/<feature>/` (e.g. `src/features/config/`). Each feature owns its components, hooks, context, and styles. Cross-cutting code (auth, theme, layout) should follow the same pattern as it's added. Avoid a top-level `components/` or `providers/` bucket.
- **Backend↔frontend type sharing**: `src/api/schema.d.ts` is auto-generated from the backend's OpenAPI document via `npm run gen:api`. Do not hand-edit it. Feature code derives DTO types from it (e.g. `type Config = components['schemas']['ConfigResponse']` in `src/features/config/ConfigContext.ts`). The backend C# DTOs (e.g. `be_dunnit.Dtos.ConfigResponse`) are the source of truth. The OpenAPI JSON itself (`be-dunnit/be-dunnit.json`) is a build artifact and gitignored — the committed artifact is the generated `schema.d.ts`.
- A project `.npmrc` sets `legacy-peer-deps=true` because `openapi-typescript@7.x` declares peer `typescript@^5.x` but the project is on TS 6. The tool works fine — only the peer-dep declaration is stale. Remove this if/when openapi-typescript bumps its peer range.
- Backend URL is resolved at runtime from `window.location.origin` via a hard-coded map in `src/features/config/ConfigProvider.tsx` (`apiPrefixByOrigin`). One built bundle is deployed to multiple hosts; each host's origin maps to its corresponding backend (e.g. `localhost:5888 → localhost:5999`, `staging.myroute.com → staging.api.myroute.com`). Add new environments by adding entries to that map.
- `ConfigProvider` fetches `/config` on mount and blocks rendering (shows a spinner) until it resolves; on failure it renders an error UI with a Retry button. Consumers read config via the `useConfig()` hook from `src/features/config/ConfigContext.ts`. The context+hook live in a separate file from the provider to satisfy `react-refresh/only-export-components` (a `.tsx` file can't export both a component and a hook without breaking Fast Refresh) — these two files should always stay co-located.
