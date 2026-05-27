# dunnit
Make a list, add todo items to the list and check it off when you've "dunnit".

This is meant to be a true production level build out

## Codebase Overview
Dunnit is a monorepo appliation that includes 
* `/fe-dunnit` (frontend): in react typescript app surved with vite 
* `/be-dunnit` (backend): a dotnet web api sitting ontop of a sql database


## Development

### OpenAPI type syncing
We use OpenAPI to sync types so we are confident that our frontend is using types that our backend is actually using.

We keep `/fe-dunnit/src/api/schema.d.ts` up to date the latest type definitions by running the following command from the `/fe-dunnit` directory.
```
npm run gen:api
```


## TODOs

### DB
Demo decissions: I'm running SQLite in this process which I wouldn't want to do in a production environment.
