# Tremor – Dashboard

`Dashboard` is a SaaS application template from [Tremor](https://tremor.so). It's built
using [`Tremor Raw`](https://raw.tremor.so/docs/getting-started/installation)
and [Next.js](https://nextjs.org).

## Getting started

1. Install the dependencies. We recommend using pnpm. If you want to use `npm`,
   just replace `pnpm` with `npm`.

```bash
pnpm install
```

2. Then, start the development server:

```bash
pnpm run dev -- --port 8080
```

3. Visit [http://localhost:8080](http://localhost:8080) in your browser to view
   the template.

## Manual API integration testing

The Accounts page is wired to the Core API through Next.js server actions. Keep
`CORE_API_URL` set to the API origin only (without `/api`):

```dotenv
CORE_API_URL=http://127.0.0.1:8000
```

Start the Core API first, then run the frontend on a known port:

```bash
pnpm dev -- --port 8080
```

Open [http://localhost:8080/accounts](http://localhost:8080/accounts). The
page exercises `GET /api/accounts`, `POST /api/accounts`,
`PATCH /api/accounts/{id}`, and `DELETE /api/accounts/{id}` from the Add,
Edit, and Delete controls. API credentials, when needed, are read only by the
Next.js server from `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET`.

To run the API and frontend together with Docker Compose, from this directory
use:

```bash
docker compose -f compose.integration.yaml up --build --wait
```

Then open [http://localhost:5173/accounts](http://localhost:5173/accounts).
In this mode Compose supplies `CORE_API_URL=http://api:8000` to the frontend;
when the API runs directly on the host, use the localhost value above instead.

## Notes

This project uses
[`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to
automatically optimize and load Inter, a custom Google Font.

This project uses
[`Tremor Raw`](https://raw.tremor.so/docs/getting-started/installation)
components for the UI.

## License

This site template is a commercial product and is licensed under the
[Tremor License](https://blocks.tremor.so/license).

## Learn more

For a deeper understanding of the technologies used in this template, check out
the resources listed below:

- [Tremor Raw](https://raw.tremor.so) - Tremor Raw documentation
- [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework
- [Next.js](https://nextjs.org/docs) - Next.js documentation
- [Radix UI](https://www.radix-ui.com) - Radix UI Website
- [Recharts](https://recharts.org) - Recharts documentation and website
- [Tanstack](https://tanstack.com/table/latest) - TanStack table documentation
