# CrewSim Admin Dashboard

React, TypeScript, Tailwind CSS, and Tremor Raw administration UI for managing
CrewSim users and eSIMs through a FastAPI REST API.

## Run locally

```bash
npm install
npm run dev
```

Set `VITE_USE_MOCK_API=true` to use the bundled Mock Service Worker API. Set it
to `false` to use a real backend. `VITE_API_BASE_URL` configures the backend
base URL; when omitted, requests use the current origin.

## REST API contract

The frontend currently expects array responses, numeric IDs, and these routes:

| Resource | List | Create | Update | Delete |
| --- | --- | --- | --- | --- |
| Users | `GET /users` | `POST /users` | `PATCH /users/{id}` | `DELETE /users/{id}` |
| eSIMs | `GET /esims` | `POST /esims` | `PATCH /esims/{id}` | `DELETE /esims/{id}` |

User create/update bodies contain `email`, `language`, `currency`, and
`timezone`. eSIM create/update bodies contain `user` (the user's email) and
`imsi` (a digit-only string). The backend remains responsible for
authorization, relationship validation, exact IMSI length, and uniqueness.

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
