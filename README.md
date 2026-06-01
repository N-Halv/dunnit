# dunnit

Make a list, add a todo item to the list and check it off when you've "dunnit".

## Codebase overview

Dunnit is a monorepo with two sibling projects:

- `dunnit-web/` (frontend) — React + TypeScript app served by Vite, MUI for components, Redux Toolkit for state, Auth0 for sign-in
- `Dunnit.Api/` (backend) — ASP.NET Core Web API on .NET 10, EF Core on SQLite, JWT auth via Auth0

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

## Backlog

- Real non-SQLite database for production
- Periodic normalization of the `SortOrder` columns
- Websockets for async updates
- Don’t use cacheLocation="localstorage” for -Auth0Provider but instead use “memory”. Better defence against SSX.
