# Organisation API

Backend REST API for the Organisation application. It manages organisations,
their members, news items and payments, with JWT-based authentication.

## Tech stack

- **Node.js** + **Express 4** (TypeScript)
- **TypeORM** + **PostgreSQL**
- **JWT** auth (`express-jwt`, `jsonwebtoken`), passwords hashed with `bcrypt`
- Validation with `joi`, email via `nodemailer`, file uploads via
  `express-fileupload`

## Prerequisites

- Node.js 18+ and npm
- A running PostgreSQL instance

## Setup

```bash
npm install
cp .env.example .env   # then fill in the values
```

See [.env.example](.env.example) for all supported environment variables.

## Running

```bash
# Development (rebuild + restart on change)
npm run dev

# Production
npm run build
npm start
```

The server listens on `SERVER_PORT`. Uploaded files are served from
`/static` (backed by the `PUBLIC_FOLDER` directory).

## Testing

```bash
npm test
```

## Project structure

```
src/
  app.ts                 Express app setup (middleware, CORS, DB connection)
  index.ts               Server entry point
  config.ts              TypeORM connection options
  routes/                HTTP routing (routes.ts wires the API sub-routers)
    api/<resource>/      Route handlers per resource
  services/              Business logic
  repositories/          TypeORM data-access
  entities/              Database models
  utilities/             Auth token helpers, validation, email, responses
  middleware/            Express middleware (auth header, email checks)
```

Requests flow **route → service → repository → entity**, and responses are
built with the `ResponseBuilder` in `utilities/response.ts`.

## API overview

Public (no token required): `POST /api/auth/login`, `POST /api/auth/signup`,
`GET /api/auth/verify`, `POST /api/auth/set-password`,
`PUT /api/auth/reset-password`, and several read endpoints for
organisations, members and news. All other endpoints require a
`Authorization: Bearer <token>` header.

| Resource      | Base path            |
| ------------- | -------------------- |
| Auth          | `/api/auth`          |
| Members       | `/api/member`        |
| Organisations | `/api/organisation`  |
| News          | `/api/news`          |
| Payments      | `/api/payments`      |

## Notes / known limitations

- **Schema sync:** `config.ts` sets TypeORM `synchronize: true`, which
  auto-updates the database schema on every boot. This is convenient in
  development but risky in production (potential data loss) — switch to
  migrations before deploying.
- **Dependencies:** several dependencies are outdated and have known
  advisories (`npm audit`); upgrading (notably TypeORM) is tracked as a
  separate effort.
