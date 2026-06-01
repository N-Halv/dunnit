# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Dunnit is a todo-list app. It's a monorepo with two sibling projects:

- `dunnit-web/` — React 19 + Vite frontend (TypeScript, MUI, Redux Toolkit, Auth0, dnd-kit)
- `Dunnit.Api/` — ASP.NET Core Web API on .NET 10 backed by SQLite (EF Core)

The two halves are independent projects with their own tooling; there is no root-level package manager or build orchestration. Work in the relevant subdirectory.

## Common commands

### Frontend (`dunnit-web/`)
- `npm run dev` — start the Vite dev server with HMR (port 5888)
- `npm run build` — production build (`tsc -b && vite build`)
- `npm run lint` — run ESLint
- `npm run format` / `npm run format:check` — Prettier write / check
- `npm run preview` — preview the production build
- `npm run gen:api` — regenerate `src/api/schema.d.ts` from the backend's OpenAPI document. Runs `dotnet build` on `../Dunnit.Api` (which emits `Dunnit.Api.json` via the `Microsoft.Extensions.ApiDescription.Server` MSBuild target — no running backend needed) and then pipes it through `openapi-typescript`. Run this whenever a backend DTO or route signature changes.

### Backend (`Dunnit.Api/`)
- `dotnet run` — runs on `http://localhost:5999` (http profile, the default) or `https://localhost:7170` (https profile via `dotnet run --launch-profile https`)
- `dotnet build` — build the project (also runs Roslyn analyzers; warnings appear in build output)
- `dotnet format` — apply formatting + code-style fixes (driven by `.editorconfig`). Equivalent to `prettier --write`.
- `dotnet format --verify-no-changes --severity warn` — CI-style check, fails if anything is unformatted or violates a warning-severity style rule. Equivalent to `prettier --check`.
- `dotnet ef migrations add <Name>` / `dotnet ef database update` — EF Core migration tooling (the `dotnet-ef` tool is pinned in `Dunnit.Api/dotnet-tools.json`; run `dotnet tool restore` first)
- OpenAPI is exposed in Development via `app.MapOpenApi()` (see `Program.cs`)
- Migrations are applied automatically on startup in Development; in production they would be applied as part of the deploy
- `Dunnit.Api.http` contains sample requests usable from the VS Code REST Client / Rider HTTP client

## Architecture notes

### Backend
- **Endpoint style**: MVC controllers under `Controllers/`. New endpoints should go in a controller; reserve minimal API for trivial one-offs.
- **Namespaces**: Root is `Dunnit.Api`. Controllers in `Dunnit.Api.Controllers`, DTOs in `Dunnit.Api.Dtos`, services in `Dunnit.Api.Services`, EF models in `Dunnit.Api.Models`, EF configuration in `Dunnit.Api.Data.Configurations`.
- **Layering**: Controllers stay thin and delegate to services. Each domain service has an `IFoo` + `Foo` pair registered as scoped in DI (`Program.cs`).
- **Persistence**: EF Core 10 with SQLite. `AppDbContext` stamps `CreatedAt`/`UpdatedAt` automatically for entities that implement `ITimestamped`. Soft-delete is implemented via `DeletedAt` and EF Core query filters on each entity configuration — deleted rows are invisible to normal queries.
- **Sort order**: Lists and items use a `double SortOrder`. Reorders pick a new value between the preceding row's order and the next one's (or ±1 if at an edge). This avoids rewriting every row on a drag, but values can converge over time and may eventually need a one-time normalization pass.
- **Authentication**: Auth0 JWT via `Microsoft.AspNetCore.Authentication.JwtBearer`. `AddAuthorization` sets a `FallbackPolicy` that requires an authenticated user for every endpoint; opt out with `[AllowAnonymous]` (used by `ConfigController`).
- **Current user**: Controller actions accept `[CurrentUser] User user`. The `CurrentUserModelBinder` reads the `email` claim from the JWT, calls `IUserService.GetOrCreateByEmailAsync`, and binds the resulting `User`. The first request from a new email seeds the user row.
- **Validation**: FluentValidation with `SharpGrip.FluentValidation.AutoValidation.Mvc`. Validators in `Validators/` are auto-discovered from the assembly. Failed validation returns standard `ValidationProblemDetails`.
- **Errors**: `app.UseExceptionHandler()` + `AddProblemDetails()` is wired; custom handlers (e.g. `UnauthorizedExceptionHandler`) emit RFC 7807 ProblemDetails so the client always sees the message in `detail`.
- **CORS**: allowed origins are read from `Cors:AllowedOrigins` in `IConfiguration` (set in `appsettings.Development.json`, overridable via env var `Cors__AllowedOrigins__0=...`). Don't hard-code origins in `Program.cs`.

### Frontend
- **Language**: TypeScript with `verbatimModuleSyntax` enabled — type-only imports must use `import type { ... }`. Build runs `tsc -b && vite build`. ESLint flat config in `eslint.config.js` enforces sorted imports, the type-import rule, and eqeqeq.
- **Feature organization**: code lives under `src/features/<feature>/` (e.g. `auth`, `config`, `lists`, `user`, `layout`, `ui`). Each feature owns its components, hooks, slices, and contexts. Cross-cutting code follows the same pattern. Avoid a top-level `components/` or `providers/` bucket.
- **State**: Redux Toolkit. `src/store/store.ts` registers slices. Domain data slices live under their feature (e.g. `features/lists/listsSlice.ts`). Use the typed `useAppDispatch` / `useAppSelector` from `src/store/hooks.ts`, never the raw `useDispatch` / `useSelector`.
- **Backend↔frontend type sharing**: `src/api/schema.d.ts` is auto-generated from the backend's OpenAPI document via `npm run gen:api`. Do not hand-edit it. Feature code derives DTO types from it (e.g. `type ListEntity = components['schemas']['ListResponse']`). The backend C# DTOs (e.g. `Dunnit.Api.Dtos.ListResponse`) are the source of truth. The OpenAPI JSON itself (`Dunnit.Api/Dunnit.Api.json`) is a build artifact and gitignored.
- **API client**: `useApi` (in `features/auth/useApi.ts`) returns a `fetch`-like function that injects the Auth0 access token, logs out on 401, and surfaces server messages from ProblemDetails (`detail` / `errors` / `title`) via the shared toast. Per-feature hooks (`useLists`, `useItems`) wrap it and dispatch into Redux.
- **Styling**: theme tokens and component overrides live in `src/theme/theme.ts`. **Keep ALL styling decisions in `theme.ts`** — no `sx`, no per-component CSS files. Use semantic global classes (e.g. `dunnit-pane-empty`, `dunnit-fullscreen-stack`) defined in `MuiCssBaseline.styleOverrides`.
- **Shared UI primitives**: `features/ui/` holds cross-cutting building blocks — `ToastProvider`/`useToast`, `ConfirmProvider`/`useConfirm`, `IconMenu`, `FullScreenSpinner`, `LoadFailedScreen`. The split between Provider and Context files (e.g. `ConfigProvider.tsx` + `ConfigContext.ts`) is intentional: a `.tsx` file can't export both a component and a hook without breaking React Fast Refresh.
- **Boot sequence**: `main.tsx` mounts `Redux > Theme > Toast > Confirm > Router > Config > Auth > User > App`. `ConfigProvider` fetches `/config` and blocks rendering until it resolves (`FullScreenSpinner`) or errors (`LoadFailedScreen`). `AuthProvider` gates rendering on Auth0 sign-in. `UserProvider` fetches `/users/me` so the rest of the app can read the current user from Redux.
- **Backend URL resolution**: `src/api/baseUrl.ts` maps `window.location.origin` to a backend prefix (e.g. `localhost:5888 → localhost:5999`). One built bundle is deployed to multiple hosts; each host's origin maps to its corresponding backend. Add new environments by adding entries to that map.
- **Drag-and-drop**: `@dnd-kit` powers reordering for both lists and items. On drag end, the relevant `useLists`/`useItems` hook dispatches an optimistic local reorder and then `PATCH`es the new position to the server; the server-returned canonical SortOrder is applied on response.

## Project-specific gotchas
- A project `.npmrc` sets `legacy-peer-deps=true` because `openapi-typescript@7.x` declares peer `typescript@^5.x` but the project is on TS 6. The tool works fine — only the peer-dep declaration is stale. Remove this if/when `openapi-typescript` bumps its peer range.
- The Auth0 SDK is configured with `cacheLocation="localstorage"` and `useRefreshTokens=true`. localStorage caching means tokens survive page reloads but are exposed to XSS — fine for an MVP, worth revisiting before launch.
- `useApi` shows a toast for **every** non-OK response. Callers that render their own error UI (e.g. `useLists` on initial fetch) will show both the toast and the inline error — known UX quirk worth revisiting.
