# CrewSim Admin Dashboard

React, TypeScript, Tailwind CSS, and Tremor Raw administration UI for managing
CrewSim users and eSIMs through a FastAPI REST API.

## Run locally against FastAPI

Start the backend stack and seed its database:

```bash
cd ../core-crewsim
docker compose up --build --wait
docker compose exec api python -m app.seed
```

Then start the frontend development server from this repository:

```bash
npm ci
npm run dev
```

The frontend is available at `http://localhost:5173`. Development requests to
`/api` are proxied to `http://localhost:8000`, avoiding cross-origin browser
requests. `CORE_API_URL` can override that development proxy target.

The checked-in development environment uses the real API. To use the bundled
Mock Service Worker API for a single run instead, use:

```bash
VITE_USE_MOCK_API=true npm run dev
```

`VITE_API_BASE_URL` is a build-time browser setting and defaults to `/api`.
Keep that default when the deployment routes `/api/*` to the backend on the
same origin. For a locked Nixpacks static deployment that cannot proxy API
requests, set it to the backend's public API origin, for example
`https://api.example.com/api`.

### Static Nixpacks test deployment

When Dokploy uses Nixpacks with `dist` as the Publish Directory, configure
these variables on the frontend application before rebuilding it:

```dotenv
VITE_API_BASE_URL=https://api.example.com/api
CF_ACCESS_CLIENT_ID=<service-token-client-id>
CF_ACCESS_CLIENT_SECRET=<service-token-client-secret>
```

This project's Vite configuration deliberately exposes the two `CF_ACCESS_*`
variables to client code. During `npm run build`, Vite embeds their values in
`dist`; the shared API client then sends `CF-Access-Client-Id` and
`CF-Access-Client-Secret` on every backend request. Changing these variables in
Dokploy requires a rebuild/redeploy because the static Nginx container cannot
read them at runtime.

This mode is only suitable for an isolated test environment: anyone who can
load the application can recover and reuse the service token. Revoke or rotate
the token before moving to a server-side proxy or production deployment.

Direct browser requests are cross-origin and preflighted. The Cloudflare
Access application must have a Service Auth policy for the service token and
must either bypass OPTIONS requests to the API or answer preflight requests.
The API/Access CORS response must allow the frontend origin, credentials,
`GET`, `POST`, `PATCH`, `DELETE`, and `OPTIONS`, plus the `Content-Type`,
`CF-Access-Client-Id`, and `CF-Access-Client-Secret` request headers.

In a dynamic Dokploy deployment, configure `CF_ACCESS_CLIENT_ID`,
`CF_ACCESS_CLIENT_SECRET`, and `CORE_API_URL` as runtime environment variables
on the frontend container. Vite reads them when the container starts, proxies
`/api/*` to `CORE_API_URL`, and attaches the corresponding Cloudflare Access
service-token headers. The secret is not included in the browser bundle. These
runtime proxy settings do not apply when Dokploy serves a Nixpacks Publish
Directory with its static Nginx image.

The container runs `npm start`, which serves the built application with Vite on
port `8080`. Set `PORT` to change the container port if the deployment platform
requires a different one.

`VITE_USE_MOCK_API`, `VITE_API_BASE_URL`, and the intentionally exposed
`CF_ACCESS_*` values are build-time frontend settings.
`NIXPACKS_NODE_VERSION` selects the Node.js major version used by Nixpacks and
the Docker build; it defaults to `24` in the supplied configuration.

## Run the integrated Docker stack

The integration Compose file includes the backend stack from the sibling
`core-crewsim` repository and adds this frontend as a Vite container:

```bash
docker compose -f compose.integration.yaml up --build --wait
docker compose -f compose.integration.yaml exec api python -m app.seed
```

Open `http://localhost:5173`. Vite serves the frontend and proxies `/api/*` to
the FastAPI `api` service on the shared Compose network. Override the frontend
host port with `FRONTEND_PORT`, if needed:

```bash
FRONTEND_PORT=8080 docker compose -f compose.integration.yaml up --build --wait
```

Stop the integration stack while preserving its PostgreSQL data with:

```bash
docker compose -f compose.integration.yaml down
```

## REST API contract

The frontend currently expects array responses, numeric IDs, and these routes:

| Resource | List | Create | Update | Delete |
| --- | --- | --- | --- | --- |
| Users | `GET /api/users` | `POST /api/users` | `PATCH /api/users/{id}` | `DELETE /api/users/{id}` |
| Accounts | `GET /api/accounts` | `POST /api/accounts` | `PATCH /api/accounts/{id}` | `DELETE /api/accounts/{id}` |
| eSIMs | `GET /api/esims` | `POST /api/esims` | `PATCH /api/esims/{id}` | `DELETE /api/esims/{id}` |

User create/update bodies contain `email`, `language`, `currency`, and
`timezone`. Account create/update bodies contain `name` and numeric `balance`.
eSIM create/update bodies contain numeric `account_id`, optional numeric
`user_id`, and `imsi` (a non-empty string). All list routes accept `offset` and
`limit`; eSIMs can be filtered with `user_id`, and
`GET /api/accounts/{id}/esims` returns an account's assigned eSIMs. The backend
remains responsible for authorization and relationship validation.

The mock API supplies deterministic Users, Accounts, and eSIM records and
supports CRUD operations for each resource. It rejects unknown eSIM user or
account relationships and prevents deletion of accounts referenced by eSIMs.
Mock state resets on page refresh and before each Storybook story.

## Frontend architecture

The source tree is organized by app shell, feature ownership, and shared
infrastructure:

```text
src/
├── app/
│   ├── App.tsx
│   ├── App.stories.tsx
│   └── components/
├── features/
│   ├── accounts/
│   ├── users/
│   └── esims/
├── shared/
│   ├── api/
│   ├── lib/
│   ├── mocks/
│   └── ui/
├── assets/
├── index.css
└── main.tsx
```

Feature slices own their API calls, model types, pages, UI components, stories,
and mock data. Each feature exposes app-facing pages from its root `index.ts`;
cross-feature contracts must go through a feature `api`, `model`, or `mocks`
barrel instead of importing another feature's private files directly.

`app` composes the shell and may depend on features and shared modules.
Features may depend on shared modules. `shared` contains domain-neutral API,
library, mock-composition, and UI code, and must not import `app` or feature
modules except for `shared/mocks`, which intentionally aggregates feature mock
handlers for development and Storybook.

Mock fixtures and handlers are isolated from production barrels. The browser
MSW worker is loaded only by `src/main.tsx` in development when
`VITE_USE_MOCK_API=true`, so production builds do not statically import MSW
handlers or fixture data.

## Commands

```bash
npm run lint
npm run build
npm run storybook
npm run build-storybook
```

Storybook includes populated, empty, loading, validation, mutation-error, and
service-error states for Users, Accounts, and eSIM management.

## TODO

- Add authentication and authorization once the FastAPI contract is defined.
