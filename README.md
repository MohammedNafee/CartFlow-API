# CartFlow API

A small RESTful API for an e-commerce style cart system written in TypeScript and Express, using PostgreSQL for persistence and db-migrate for schema migrations.

This README covers project overview, data model relationships, setup and running instructions (Windows PowerShell focused), migrations, available API endpoints, environment variables, and developer notes.

## Quick facts

- Language: TypeScript
- Runtime: Node.js (CommonJS)
- Frameworks/Libraries: Express, pg (node-postgres), db-migrate
- Dev tools: TypeScript, ts-node, nodemon

## Relationship summary

- Cart has many Items
- Item belongs to a Product
- User has one active Cart

In other words:

- One User can own many Carts across time, but only one Cart should be marked with status `active` at any time (the API exposes a route to fetch the active cart for a user).
- Each Cart contains multiple Items (items reference `cart_id`).
- Each Item references a Product (`product_id`) and stores a quantity and the per-item price at time of addition.

## Project structure

Top-level files and folders of interest:

- `src/` — TypeScript source files
	- `server.ts` — Express app and route mounting
	- `handlers/` — Express route handlers (users, products, carts, items)
	- `models/` — Data access objects that interact with PostgreSQL (UserStore, ProductStore, CartStore, ItemStore)
	- `services/` — Shared services (authentication)
- `migrations/` — db-migrate migration files
- `sqls/` — SQL files used by migrations (up/down)
- `database.js` — db-migrate configuration loader (reads environment variables)
- `package.json` — scripts and dependencies
- `tsconfig.json` — TypeScript configuration

## Environment

Create a `.env` file in the project root (not checked in) with the following variables for development (example values):

```
POSTGRES_HOST=
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

TEST_POSTGRES_HOST=
TEST_POSTGRES_DB=
TEST_POSTGRES_USER=
TEST_POSTGRES_PASSWORD=

TOKEN_SECRET=
BCRYPT_PASSWORD_SALT=
BCRYPT_SALT_ROUNDS=
```

Notes:
- `database.js` loads `.env` by default and `.env.test` when running in test mode. Adjust accordingly.
- Keep secrets out of version control. Use secure values in production.

## Install

From the project root, install dependencies:

```powershell
npm install
```

## Scripts

Key npm scripts from `package.json`:

- `npm run build` — runs the TypeScript compiler via `npx tsc` and outputs to `dist/`.
- `npm start` — starts the server in development using `nodemon src/server.ts` (requires globally available nodemon or it being installed in devDependencies — this project has it in devDependencies).

To run the server in PowerShell (development):

```powershell
npm start
```

If you want to compile to JavaScript and run the compiled files manually:

```powershell
npm run build
node dist/server.js
```

## Database migrations

This project uses `db-migrate` with `db-migrate-pg`. Migration files are in `migrations/`. SQL helpers are in `sqls/`.

Typical commands (PowerShell):

```powershell
npx db-migrate up   ;# run all pending migrations
npx db-migrate down ;# revert last migration
```

db-migrate reads `database.js` for configuration which, in turn, loads environment variables from `.env` or `.env.test` depending on environment.

Migration files included (present in repo):

- `20251018113830-products-table.js` (+ up/down SQL in `sqls/`)
- `20251018115018-users-table.js` (+ up/down SQL in `sqls/`)
- `20251018122551-carts-table.js` (+ up/down SQL in `sqls/`)
- `20251018123049-items-table.js` (+ up/down SQL in `sqls/`)

Each migration has matching SQL files in `sqls/` that define table creation and teardown.

## API Endpoints

Below is a summary of the public routes implemented by the handlers in `src/handlers`.

Users
- `GET /api/users` — list users (authorization required)
- `GET /api/users/:id` — get user by id (authorization required)
- `POST /api/users` — create new user (returns JWT token)
- `POST /api/users/authenticate` — authenticate user (returns JWT token)

Products
- `GET /api/products` — list products
- `GET /api/products/:id` — get product by id
- `POST /api/products` — create product

Carts
- `POST /api/carts` — create a new cart for a user (expect cart payload)
- `GET /api/carts/active/:userId` — get the active cart for a user
- `PUT /api/carts/:id/complete` — mark cart as completed

Items
- `POST /api/items` — add an item to a cart
- `DELETE /api/items/:id` — remove an item from a cart (decrements quantity, deletes when 0)
- `GET /api/items/:id` — get item by id
- `GET /api/carts/:cartId/items` — list items by cart id

Authentication

Handlers call an `authorize` function in `src/services/auth.ts` to guard certain routes. The user creation and authentication endpoints issue JWT tokens signed with `TOKEN_SECRET`.

Example: create a user and obtain a token (PowerShell curl via node's httpie is not included; you can use curl if available):

```powershell
curl -Method POST -Uri http://localhost:3000/api/users -Body (@{ firstName='Jane'; lastName='Doe'; password='password' } | ConvertTo-Json) -ContentType 'application/json'
```

The response body will be a JWT token string on successful user creation.

## Data model (summary)

Tables (as implemented in migrations):

- users — stores firstname, lastname and password hash
- products — stores name, price, description
- carts — stores user_id, status (e.g., `active`, `completed`), created_at
- items — stores cart_id, product_id, quantity, price

Relationship recap:

- Cart (1) —< Items (many)
- Item (many) —> Product (1)
- User (1) —(has) Active Cart (1)

The `models` implement the queries that realize these relations (e.g., `ItemStore.getItemsByCartId`, `CartStore.getActiveCartByUser`).

## Development notes & suggestions

- The TypeScript config uses `module: nodenext` and `type: commonjs` in `package.json`. This generally works but can require attention when targeting compiled output or when mixing ESM/CJS modules.
- Tests: there are no tests included yet. Consider adding a small test suite (Jest or Mocha) and a `.env.test` file for test DB credentials.
- Input validation: the handlers currently forward `req.body` straight to model methods. Adding request validation (e.g., using `zod` or `joi`) would harden the API.
- Transactions: adding and removing items that adjust quantities could be made transactional to avoid race conditions.

## Troubleshooting

- If migrations fail, ensure the environment variables for Postgres connection are set and that Postgres is reachable.
- If JWT signing errors occur, ensure `TOKEN_SECRET` is set.

## Next steps you might want

- Add integration tests that run migrations against a test database and spin up the server.
- Add Swagger/OpenAPI docs for the endpoints.
- Harden authentication and add role-based access if necessary.
