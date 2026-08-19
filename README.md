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
requests. `API_PROXY_TARGET` can override that development proxy target.

The checked-in development environment uses the real API. To use the bundled
Mock Service Worker API for a single run instead, use:

```bash
VITE_USE_MOCK_API=true npm run dev
```

`VITE_API_BASE_URL` is a build-time browser setting and defaults to `/api` in
the supplied environment files. It should not be set to the Docker hostname
`api`, because that name is only resolvable between containers.

In a Dokploy deployment, set `CF_ACCESS_CLIENT_ID` and
`CF_ACCESS_CLIENT_SECREt` as runtime environment variables on the frontend
container. Nginx reads them when the container starts and attaches the
corresponding Cloudflare Access service-token headers to proxied `/api/*`
requests. The secret is not included in the browser bundle.

## Run the integrated Docker stack

The integration Compose file includes the backend stack from the sibling
`core-crewsim` repository and adds this frontend as an Nginx container:

```bash
docker compose -f compose.integration.yaml up --build --wait
docker compose -f compose.integration.yaml exec api python -m app.seed
```

Open `http://localhost:5173`. Nginx serves the frontend and proxies `/api/*` to
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
| eSIMs | `GET /api/esims` | `POST /api/esims` | `PATCH /api/esims/{id}` | `DELETE /api/esims/{id}` |

User create/update bodies contain `email`, `language`, `currency`, and
`timezone`. eSIM create/update bodies contain `user_id` (the user's numeric
ID) and `imsi` (a digit-only string). The backend remains responsible for
authorization, relationship validation, and uniqueness.

The mock API supplies deterministic Users and eSIM records and supports all
four CRUD operations for both resources. Its eSIM handlers reject missing or
unknown users, missing or non-digit IMSIs, duplicate IMSIs, and unknown IDs.
Mock state resets on page refresh and before each Storybook story.

## Commands

```bash
npm run lint
npm run build
npm run storybook
npm run build-storybook
```

Storybook includes populated, empty, loading, validation, mutation-error, and
service-error states for the eSIM page and its reusable table and form dialog.

## TODO

- Add authentication and authorization once the FastAPI contract is defined.
