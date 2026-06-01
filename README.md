<picture>
  <source media="(prefers-color-scheme: dark)" srcset="dunnit-web/public/logo.svg">
  <img alt="Dunnit" src="dunnit-web/public/logo_dark.svg" width="180">
</picture>

Make a list, add a todo item to the list and check it off when you've "dunnit".

## Local Quickstart

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
- `Dunnit.Api.Tests/` (backend tests) - Integration tests for Dunnit backend. Tests http routes through to the database.

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

## Project State

This project is a near-production ready.

What its missing:

- Better UX - I'd love to have a designer make this better. I think its pretty solid and intuitive but it could use someone who knows what they're doing to make it easier to use and prettier.
- Our sort order tooling breaks after enough resorting because we are doing this floating point calculation that could get funky if we resort too much. I'd feel confortable deploying this though with a fast follows to make more robust.
- Websockets - In a production environment I'd want to handle a multiple device or tab scenerio but I did not focus on this for time.
- Use a real database - SQLite isn't a real database solution I'd want to use in production.
- There is a XSS risk with our use of localhost to store out token. I made that decission because using the Auth0's silent refresh doesn't work with the development environemnt I have configured. If we had a production ready Auth0 environment I'd use it.
- I'd want to show more deliberate frontend error messages. I didn't focus on this much, so I'm using mostly generic error messages.
- CI/CD - We aren't actually deploying it anywhere so its.
- A health check endpoint that we'd use for our deployment. We just didn't need one yet so I didn't build it.
- Production ready logging - We aren't logging anything from the frontend and logs on the backend are just going to standard out. Since we aren't acutlly deploying this yet I didn't want to make fake decissions on how this would work.
- Production ready observability - I'd deploy without APM but I wouldn't want to wait too long without it.
- Frontend testing for very mission critical things. I leaned into backend testing because that's where security matters and taking care of data matters.

### If I had one more day:

If i had one mor day I would focus on

- Fixing the `SortOrder` issue with periodic normalization of the `SortOrder` columns when something happens.
- Websockets because the SortOrder fix isn't fully right unless we can push changes to the frontend.
