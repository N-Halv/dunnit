<picture>
  <source media="(prefers-color-scheme: dark)" srcset="dunnit-web/public/logo.svg">
  <img alt="Dunnit" src="dunnit-web/public/logo_dark.svg" width="180">
</picture>

Make a list, add a todo item to the list and check it off when you've "dunnit".

## Local setup

You need: Node 20+, .NET 10 SDK.

Run the backend and frontend in different terminals.

Backend startup:

```sh
cd Dunnit.Api
dotnet tool restore        # installs the pinned dotnet-ef tool
dotnet run                 # http://localhost:5999
```

Frontend startup:

```sh
cd dunnit-web
npm install
npm run dev                # http://localhost:5888
```

The frontend talks to the backend via the origin map in `dunnit-web/src/api/baseUrl.ts`. Add an entry there for any new deploy environment.

## Codebase overview

Dunnit is a monorepo with two sibling projects:

- `dunnit-web/` (frontend) — React + TypeScript app served by Vite, MUI for components, Redux Toolkit for state, Auth0 for sign-in
- `Dunnit.Api/` (backend) — ASP.NET Core Web API on .NET 10, EF Core on SQLite, JWT auth via Auth0
- `Dunnit.Api.Tests/` (backend tests) - Integration tests for Dunnit backend

## Working with the API contract

Types are shared via OpenAPI. After changing a DTO or route signature in `Dunnit.Api/`, regenerate the frontend types:

```sh
cd dunnit-web
npm run gen:api
```

This rebuilds the backend (no running server required), reads the generated `Dunnit.Api.json`, and writes `dunnit-web/src/api/schema.d.ts`. That file is committed; the OpenAPI JSON itself is gitignored.

## Database

SQLite, file at `Dunnit.Api/dunnit.db`. Schema is managed via EF Core migrations under `Dunnit.Api/Migrations/`. In Development, migrations are applied on startup (`Program.cs`); in production this would happen as part of the deploy.

To add a migration:

```sh
cd Dunnit.Api
dotnet ef migrations add <DescriptiveName>
```

## Tests

Backend integration tests live in `Dunnit.Api.Tests/`. They boot the real API via `WebApplicationFactory`, swap SQLite for an in-memory connection, and replace JWT auth with a test scheme that reads an email from the `X-Test-Email` header.

```sh
cd Dunnit.Api.Tests
dotnet test
```

Each test gets a clean database (the base class resets tables before every test).

## Backlog

- Real non-SQLite database for production
- Periodic normalization of the `SortOrder` columns
- Websockets for async updates
- Don’t use cacheLocation="localstorage” for -Auth0Provider but instead use “memory”. Better defence against SSX.
- `/health` endpoint
- Don't show error details to user in the full screen error pages. Its not dangerous but we show more information than they need.
- CI Pipeline
- Frontend error reporting
