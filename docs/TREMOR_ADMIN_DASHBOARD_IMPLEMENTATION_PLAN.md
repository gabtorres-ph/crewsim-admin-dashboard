# Tremor Admin Dashboard Implementation Plan

This document describes how to build the requested Users and eSIM administration dashboard with **Tremor Raw components**, React, TypeScript, Tailwind CSS, and FastAPI.

> [!IMPORTANT]
> This is an implementation plan with illustrative pseudocode. It does not represent completed application code. Confirm the real FastAPI endpoint paths, payloads, authentication, and validation rules before implementing it.

## Contents

1. [Technical decision](#1-technical-decision)
2. [What Tremor changes](#2-what-tremor-changes)
3. [Scope](#3-scope)
4. [Recommended file structure](#4-recommended-file-structure)
5. [Confirm the FastAPI contract](#5-confirm-the-fastapi-contract)
6. [Verify existing dependencies](#6-verify-existing-dependencies)
7. [Verify Tailwind CSS configuration](#7-verify-tailwind-css-configuration)
8. [Verify the Tremor utility helpers](#8-verify-the-tremor-utility-helpers)
9. [Reuse the Tremor UI primitives](#9-reuse-the-tremor-ui-primitives)
10. [Define shared sorting and user types](#10-define-shared-sorting-and-user-types)
11. [Create the shared request and users API client](#11-create-the-shared-request-and-users-api-client)
12. [Build the sidebar](#12-build-the-sidebar)
13. [Build the application shell](#13-build-the-application-shell)
14. [Create the Users page state](#14-create-the-users-page-state)
15. [Load users](#15-load-users)
16. [Add search](#16-add-search)
17. [Add sorting](#17-add-sorting)
18. [Build the Tremor table](#18-build-the-tremor-table)
19. [Handle loading, errors, and empty results](#19-handle-loading-errors-and-empty-results)
20. [Build the Tremor Add/Edit dialog](#20-build-the-tremor-addedit-dialog)
21. [Build the Tremor form](#21-build-the-tremor-form)
22. [Connect create and update](#22-connect-create-and-update)
23. [Connect delete](#23-connect-delete)
24. [Define the eSIM contract](#24-define-the-esim-contract)
25. [Create the eSIM API client](#25-create-the-esim-api-client)
26. [Create the eSIM page state](#26-create-the-esim-page-state)
27. [Add eSIM search and sorting](#27-add-esim-search-and-sorting)
28. [Build the Tremor eSIM table](#28-build-the-tremor-esim-table)
29. [Build the Tremor eSIM form dialog](#29-build-the-tremor-esim-form-dialog)
30. [Connect eSIM CRUD](#30-connect-esim-crud)
31. [Match the visual references](#31-match-the-visual-references)
32. [Responsive behavior](#32-responsive-behavior)
33. [Accessibility](#33-accessibility)
34. [Implementation sequence](#34-implementation-sequence)
35. [Verification checklist](#35-verification-checklist)
36. [Official references](#36-official-references)

## 1. Technical decision

Use the current **Tremor Raw copy-and-paste components**, not the older precompiled `@tremor/react` component package.

Why this plan selects Tremor Raw:

- The repository already uses React 19 and Tailwind CSS 4.
- It already contains `tailwind-variants`, `clsx`, `tailwind-merge`, and `@remixicon/react`, which are the core utilities used by Tremor Raw.
- Tremor Raw components live in this repository, so their code and styling can be adjusted when necessary.
- The current Tremor components use normal React props and Tailwind classes.
- Only the dependencies required by the selected components need to be installed.

This plan does **not** install `@tremor/react`.

Tremor Raw does not mean there is no styling code. It means Tremor supplies reusable styled components such as `Button`, `Input`, `Dialog`, and `Table`. Page layout and application-specific appearance still use Tailwind utility classes.

## 2. What Tremor changes

The application architecture remains the same as the plain-CSS plan.

### Unchanged responsibilities

- FastAPI endpoint integration
- TypeScript user and eSIM types
- Loading Users and eSIMs through the typed REST API client
- React state
- Client-side search
- Client-side sorting
- Add/Edit/Delete behavior
- Form validation
- Loading and error handling
- eSIM User and IMSI fields

### Replaced by Tremor components

| Plain implementation | Tremor implementation |
| --- | --- |
| Custom `<button>` styles | `Button` |
| Custom text/search inputs | `Input` |
| Custom styled `<select>` | `SelectNative` |
| Hand-styled table | Tremor Table components |
| Hand-built modal overlay | Tremor Dialog components |
| Large `App.css` file | Mostly Tailwind utility classes |

### Still custom

- Dashboard shell
- Sidebar layout and selected-state styling
- Page spacing
- Search and sort logic
- Form labels and validation messages
- Responsive arrangement
- The exact dark-dashboard/light-dialog visual treatment

## 3. Scope

The first version should provide:

- Sidebar items for Users and eSIMs.
- Users selected initially.
- A Users heading and Add User button.
- An eSIMs heading and Add eSIM button.
- An eSIM overview that loads and displays all records returned by the REST API.
- A search input on each page.
- A sortable user table.
- A sortable eSIM table.
- ID, Email, Language, Currency, and Timezone columns.
- eSIM columns for ID, User, and IMSI.
- Edit and Delete actions on every user and eSIM row.
- One User dialog and one eSIM dialog, each reused for Add and Edit.
- FastAPI-backed list, create, update, and delete operations for both resources.

Do not copy unrelated form fields from the reference screenshot. The User dialog needs only:

- Email
- Language
- Currency
- Timezone

The eSIM overview uses the requested minimal model:

- ID
- User
- IMSI

The Add/Edit dialog exposes User and IMSI; ID is generated by the backend and is read-only in the UI. User is confirmed as an email string in the `user` field, matching the existing frontend type. Confirm the remaining endpoint details against the FastAPI/OpenAPI contract before implementation.

### Current implementation assessment

Assessed against the repository on 2026-08-19. `npm run lint` and a no-emit TypeScript check both pass before eSIM implementation.

| Area | Current state | Required change |
| --- | --- | --- |
| Application shell | **Ready:** `App.tsx` and `Sidebar.tsx` already support an `esims` section. | **Replace:** swap the placeholder content in `App.tsx` for `EsimsPage`. |
| Tremor foundation | **Ready:** Button, Input, SelectNative, Table, and Dialog primitives are installed and used by Users. | **Reuse:** no new UI dependency or primitive is needed. |
| Reference CRUD page | **Ready:** `UsersPage` demonstrates REST loading, search, sorting, Add/Edit, Delete, loading, error, and empty states. | **Adapt:** follow its interaction and visual patterns while keeping eSIM logic in eSIM-specific components. |
| eSIM types | **Partial:** `src/types/esims.ts` defines `ESim`, `ESimInput`, and `ESimSortKey` with `id`, `user`, and `imsi`. Nothing imports them yet. | **Retain and normalize:** keep the existing `user` email shape and align exported type naming with project conventions. |
| Shared types | **Partial:** `SortDirection` currently lives in `src/types/user.ts`. | **Extract:** move it to `src/types/sort.ts` so eSIM code does not import a user-domain type. |
| REST layer | **Gap:** only `src/api/users.ts` exists, and its reusable `request()` helper is private to that file. | **Extract and add:** move the unchanged transport behavior to `src/api/request.ts`, update Users to consume it, and add `src/api/esims.ts` for list/create/update/delete. |
| eSIM page/components | **Gap:** there is no `EsimsPage`, `EsimTable`, or `EsimFormDialog`. | **Add:** implement the page orchestration, presentational table, and reusable Add/Edit dialog described below. |
| Development mocks | **Gap:** MSW data and handlers cover `/users` only. Development currently enables MSW through `VITE_USE_MOCK_API`. | **Add:** create eSIM data and CRUD handlers, register them in the combined handler list, and reset both mock stores between stories. |
| Storybook coverage | **Gap:** Users has populated, empty, loading, and error stories; eSIMs has none. | **Add:** mirror those page states and add component stories for the eSIM table and dialog. |
| Documentation | **Gap:** README still says “add esims page” and documents only the Users mock API. | **Update after implementation:** document eSIM endpoints, mock behavior, validation assumptions, and remove the stale TODO. |

The User-field blocker is resolved: the page displays, searches, sorts, creates, and updates the email directly through `esim.user`. No user-ID lookup or nested-user adapter is planned. The Users REST request remains useful only for populating the Add/Edit selector and validating the administrator's choice.

## 4. Recommended file structure

```text
src/
├── api/
│   ├── esims.ts
│   ├── request.ts
│   └── users.ts
├── components/
│   ├── EsimFormDialog.tsx
│   ├── EsimFormDialog.stories.tsx
│   ├── EsimTable.tsx
│   ├── EsimTable.stories.tsx
│   ├── Sidebar.tsx
│   ├── UserFormDialog.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Dialog.tsx
│       ├── Input.tsx
│       ├── SelectNative.tsx
│       └── Table.tsx
├── lib/
│   └── utils.ts
├── pages/
│   ├── EsimsPage.tsx
│   ├── EsimsPage.stories.tsx
│   └── UsersPage.tsx
├── mocks/
│   ├── data/
│   │   ├── esims.ts
│   │   └── users.ts
│   ├── handlers/
│   │   ├── esims.ts
│   │   └── users.ts
│   └── handlers.ts
├── types/
│   ├── esims.ts
│   ├── sort.ts
│   └── user.ts
├── App.tsx
├── index.css
└── main.tsx
```

Responsibilities:

| Location | Responsibility |
| --- | --- |
| `components/ui` | Unmodified or lightly adapted Tremor Raw primitives. |
| `components/Sidebar.tsx` | Application-specific navigation. |
| `components/UserFormDialog.tsx` | Application-specific composition of Tremor Dialog and form controls. |
| `components/EsimFormDialog.tsx` | Application-specific eSIM Add/Edit form. |
| `components/EsimTable.tsx` | Presentational ID/User/IMSI table, sortable headers, empty results, and row actions. |
| `pages/UsersPage.tsx` | User data, search, sorting, and CRUD orchestration. |
| `pages/EsimsPage.tsx` | eSIM data, search, sorting, and CRUD orchestration. |
| `api/request.ts` | Shared base URL, JSON parsing, and HTTP error handling. |
| `api/users.ts` | All FastAPI requests. |
| `api/esims.ts` | All FastAPI eSIM requests. |
| `types/sort.ts` | Sort direction shared by both tables. |
| `types/user.ts` | Shared user types. |
| `types/esims.ts` | Existing eSIM type module, updated to match the confirmed REST contract. |
| `mocks/data/esims.ts` | Deterministic eSIM records linked to mock users. |
| `mocks/handlers/esims.ts` | MSW handlers for eSIM list, create, update, validation, and delete. |
| `pages/EsimsPage.stories.tsx` | Populated, empty, loading, and error page states. |
| `lib/utils.ts` | Tremor class merging and focus/error helpers. |
| `index.css` | Tailwind import, plugin, dark-mode variant, and dialog animation definitions. |

Do not create generic abstractions such as `DataTable`, `FormBuilder`, or `ApiRepository` for this first page. They add concepts before there is a proven reuse case.

## 5. Confirm the FastAPI contract

Assumed Users contract:

| Operation | Method | Endpoint | Expected result |
| --- | --- | --- | --- |
| List | `GET` | `/users` | `200` and an array of users |
| Create | `POST` | `/users` | `201` and the created user |
| Update | `PATCH` | `/users/{id}` | `200` and the updated user |
| Delete | `DELETE` | `/users/{id}` | `204` with no response body |

Confirm:

- Whether endpoints end with `/`.
- Whether IDs are integers, strings, or UUIDs.
- Whether update uses `PATCH` or `PUT`.
- Whether the list result is an array or `{ "items": [...] }`.
- Whether authentication is required.
- Accepted language values.
- Accepted currency values.
- Accepted timezone values.
- Whether email must be unique.
- FastAPI's error-response format.

Example returned user:

```json
{
  "id": 1001,
  "email": "alex@example.com",
  "language": "en",
  "currency": "USD",
  "timezone": "Asia/Manila"
}
```

Example create/update body:

```json
{
  "email": "alex@example.com",
  "language": "en",
  "currency": "USD",
  "timezone": "Asia/Manila"
}
```

Assumed eSIM REST contract:

| Operation | Method | Endpoint | Expected result |
| --- | --- | --- | --- |
| List | `GET` | `/esims` | `200` and an array of eSIMs |
| Create | `POST` | `/esims` | `201` and the created eSIM |
| Update | `PATCH` | `/esims/{id}` | `200` and the updated eSIM |
| Delete | `DELETE` | `/esims/{id}` | `204` with no response body |

Example returned eSIM:

```json
{
  "id": 2001,
  "user": "alex@example.com",
  "imsi": "310150123456789"
}
```

Example create/update body:

```json
{
  "user": "alex@example.com",
  "imsi": "310150123456789"
}
```

Before implementation, confirm whether the backend calls the resource `/esims`, `/e-sims`, or something else; whether update uses `PATCH` or `PUT`; whether IMSI is editable; and whether list responses are arrays or paginated objects. The confirmed User payload field is `user`, containing the user's email.

The browser must never import a database client, embed database credentials, or query database tables directly. Every eSIM load, create, update, and delete operation must call the REST API. FastAPI remains responsible for persistence, authorization, uniqueness, and relationship validation.

## 6. Verify existing dependencies

The repository already contains:

- React and React DOM
- Tailwind CSS 4
- `@tailwindcss/vite`
- `tailwind-variants`
- `clsx`
- `tailwind-merge`
- `@remixicon/react`

The repository also already contains `@radix-ui/react-dialog`, `@radix-ui/react-slot`, and `@tailwindcss/forms`. No package installation is required for the eSIM work.

Why:

- Tremor `Dialog` is built on Radix Dialog.
- Tremor `Button` uses Radix Slot for its optional `asChild` behavior.
- Tremor recommends the Tailwind Forms plugin for consistent form defaults.
- `SelectNative` is deliberately selected instead of the Radix-based Tremor `Select`; this removes the need for `@radix-ui/react-select` and keeps controlled form handling simple.

Do not add more Radix packages or Tremor dependencies unless the implementation introduces a component that demonstrably requires them.

## 7. Verify Tailwind CSS configuration

The existing Vite configuration already loads Tailwind through `@tailwindcss/vite`, and `src/index.css` already contains the Forms plugin, `.dark` variant, dialog animations, and root sizing shown below. No CSS configuration change is required for the eSIM page.

Update `src/index.css` conceptually as follows:

```css
@import "tailwindcss";
@plugin "@tailwindcss/forms";

/* Make dark: utilities respond to a .dark ancestor. */
@custom-variant dark (&:where(.dark, .dark *));

/* Tremor Dialog refers to these animation utilities. */
@theme {
  --animate-dialog-overlay-show:
    dialogOverlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  --animate-dialog-content-show:
    dialogContentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dialogOverlayShow {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes dialogContentShow {
  from {
    opacity: 0;
    transform: translate(-50%, -45%) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  min-width: 320px;
}
```

Only add animation definitions used by the selected components. There is no need to copy Tremor animations for drawers, accordions, or popovers that the dashboard does not use.

## 8. Verify the Tremor utility helpers

The existing `src/lib/utils.ts` already provides `cx`, `focusInput`, `focusRing`, and `hasErrorInput` in the required shape. Reuse it unchanged unless implementation exposes a specific missing helper.

The planned shape is:

```ts
import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

export const focusInput = [
  'focus:ring-2',
  'focus:ring-blue-200 dark:focus:ring-blue-700/30',
  'focus:border-blue-500 dark:focus:border-blue-700',
]

export const focusRing = [
  'outline outline-offset-2 outline-0 focus-visible:outline-2',
  'outline-blue-500 dark:outline-blue-500',
]

export const hasErrorInput = [
  'ring-2',
  'border-red-500 dark:border-red-700',
  'ring-red-200 dark:ring-red-700/30',
]
```

`cx()` performs two jobs:

1. `clsx` joins conditional class names.
2. `tailwind-merge` resolves conflicting Tailwind utilities.

Example:

```ts
cx(
  'rounded-md bg-gray-950',
  isActive && 'bg-indigo-950 text-indigo-300',
  className,
)
```

If `isActive` is false, its classes are omitted. If the caller provides a later conflicting background class, `tailwind-merge` chooses the final applicable utility.

## 9. Reuse the Tremor UI primitives

These Tremor Raw components are already present and used by the Users feature:

| Local file | Official component | Additional dependency |
| --- | --- | --- |
| `components/ui/Button.tsx` | Button | `@radix-ui/react-slot` |
| `components/ui/Dialog.tsx` | Dialog | `@radix-ui/react-dialog` |
| `components/ui/Input.tsx` | Input | Already installed dependencies |
| `components/ui/SelectNative.tsx` | Select Native | Already installed dependencies |
| `components/ui/Table.tsx` | Table | Already installed dependencies |

When using them for eSIMs:

1. Import the existing local primitives rather than copying another version.
2. Keep the Tremor component code separate from application components.
3. Do not rewrite the internals unless a verified compatibility issue requires it.

For example, an import shown by Tremor as:

```ts
import { cx, focusRing } from '@/lib/utils'
```

would become something like:

```ts
import { cx, focusRing } from '../../lib/utils'
```

because this repository does not currently define the `@/` path alias.

Expected exports used by the dashboard:

```ts
// Button.tsx
export { Button }

// Input.tsx
export { Input }

// SelectNative.tsx
export { SelectNative }

// Table.tsx
export {
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
}

// Dialog.tsx
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
```

Names may differ slightly if the official component source changes. Treat the copied source as the authority at implementation time.

## 10. Define shared sorting and user types

Move the existing `SortDirection` declaration from `src/types/user.ts` into `src/types/sort.ts`, then update `UsersPage` and the new eSIM components to import it from the shared module:

```ts
export type SortDirection = 'ascending' | 'descending'
```

Keep the existing `src/types/user.ts` domain types, minus `SortDirection`:

```ts
export type User = {
  id: number
  email: string
  language: string
  currency: string
  timezone: string
}

export type UserInput = {
  email: string
  language: string
  currency: string
  timezone: string
}

export type UserSortKey =
  | 'id'
  | 'email'
  | 'language'
  | 'currency'
  | 'timezone'
```

The current Users API, mocks, and components consistently use numeric IDs. Do not change that as part of the eSIM feature unless FastAPI/OpenAPI proves the current assumption wrong. Keep `UserInput` separate so the form cannot accidentally send an editable ID.

## 11. Create the shared request and users API client

The existing `.env.example` already documents both development switches:

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:8000
```

Create `src/api/request.ts` by moving the current helper from `src/api/users.ts`. Preserve its empty-base fallback and trailing-slash normalization:

```ts
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '')
  .replace(/\/+$/, '')

export async function request<ResponseType>(
  path: string,
  options: RequestInit = {},
): Promise<ResponseType> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const body = await response.json()
      message =
        typeof body.detail === 'string'
          ? body.detail
          : JSON.stringify(body.detail)
    } catch {
      // Retain the status-based message for a non-JSON response.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as ResponseType
  }

  return response.json()
}
```

Create `src/api/users.ts` for only the Users endpoints:

```ts
import type { User, UserInput } from '../types/user'
import { request } from './request'

export function listUsers(): Promise<User[]> {
  return request<User[]>('/users')
}

export function createUser(input: UserInput): Promise<User> {
  return request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateUser(
  id: number,
  input: UserInput,
): Promise<User> {
  return request<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteUser(id: number): Promise<void> {
  return request<void>(`/users/${id}`, {
    method: 'DELETE',
  })
}
```

Tremor affects only presentation. Moving the existing shared-capable request helper into its own file avoids duplicating response and error handling when the eSIM client is added; this refactor must not alter current Users requests or error behavior.

## 12. Build the sidebar

Create `src/components/Sidebar.tsx`.

Use Tremor's Button as a base and Tailwind utilities for the sidebar-specific appearance:

```tsx
import {
  RiSimCardLine,
  RiUserLine,
} from '@remixicon/react'
import { cx } from '../lib/utils'
import { Button } from './ui/Button'

type Section = 'users' | 'esims'

type SidebarProps = {
  activeSection: Section
  onSectionChange: (section: Section) => void
}

export function Sidebar({
  activeSection,
  onSectionChange,
}: SidebarProps) {
  const items = [
    { id: 'users', label: 'Users', icon: RiUserLine },
    { id: 'esims', label: 'eSIMs', icon: RiSimCardLine },
  ] as const

  return (
    <aside
      className="border-b border-gray-800 bg-gray-950 p-4 md:min-h-screen md:border-b-0 md:border-r md:p-5"
    >
      <div className="mb-5 flex items-center gap-3 md:mb-10">
        <div className="grid size-10 place-items-center rounded-md bg-indigo-500 font-semibold text-white">
          CS
        </div>

        <div>
          <p className="font-semibold text-white">CrewSim</p>
          <p className="text-xs text-gray-400">Admin dashboard</p>
        </div>
      </div>

      <nav
        className="flex gap-2 md:flex-col"
        aria-label="Main navigation"
      >
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              onClick={() => onSectionChange(item.id)}
              className={cx(
                'w-full justify-start border-transparent text-gray-400',
                isActive &&
                  'bg-indigo-950 text-indigo-300 hover:bg-indigo-950',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.label}
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}
```

The Tremor Button handles baseline button appearance, focus, disabled state, and variants. Tailwind classes still define the application-specific active navigation appearance.

## 13. Build the application shell

Replace the starter content in `src/App.tsx`:

```tsx
import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { EsimsPage } from './pages/EsimsPage'
import { UsersPage } from './pages/UsersPage'

type Section = 'users' | 'esims'

function App() {
  const [activeSection, setActiveSection] =
    useState<Section>('users')

  return (
    <div className="dark min-h-screen bg-gray-950 md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="min-w-0 bg-[#050914] p-5 md:p-10">
        {activeSection === 'users' && <UsersPage />}

        {activeSection === 'esims' && <EsimsPage />}
      </main>
    </div>
  )
}

export default App
```

No router is needed for the first version. Add React Router later if deep links, browser history, or routes such as `/users` and `/esims` become requirements.

The `dark` class scopes Tremor's dark variants to the dashboard application.

## 14. Create the Users page state

Create `src/pages/UsersPage.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react'
import type {
  User,
  UserInput,
  UserSortKey,
} from '../types/user'
import type { SortDirection } from '../types/sort'
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from '../api/users'

type DialogMode = 'add' | 'edit' | null

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<UserSortKey>('id')
  const [sortDirection, setSortDirection] =
    useState<SortDirection>('ascending')

  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [dialogMode, setDialogMode] =
    useState<DialogMode>(null)
  const [selectedUser, setSelectedUser] =
    useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] =
    useState<string | null>(null)

  // Loading, filtering, sorting, and CRUD functions follow.
}
```

Tremor components do not own this application state. They receive state through props and report user actions through callbacks.

## 15. Load users

```tsx
async function loadUsers() {
  setLoading(true)
  setPageError(null)

  try {
    const result = await listUsers()
    setUsers(result)
  } catch (error) {
    setPageError(
      error instanceof Error
        ? error.message
        : 'Unable to load users',
    )
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  void loadUsers()
}, [])
```

The `finally` block runs after either success or failure, ensuring the loading indicator stops.

## 16. Add search

Use Tremor Input for the search control:

```tsx
import { RiSearchLine } from '@remixicon/react'
import { Input } from '../components/ui/Input'

<Input
  type="search"
  icon={RiSearchLine}
  value={search}
  placeholder="Search users..."
  aria-label="Search users"
  onChange={(event) => setSearch(event.target.value)}
  className="w-full sm:max-w-sm"
/>
```

Derive filtered users:

```tsx
const filteredUsers = useMemo(() => {
  const query = search.trim().toLowerCase()

  if (!query) {
    return users
  }

  return users.filter((user) =>
    [
      user.id,
      user.email,
      user.language,
      user.currency,
      user.timezone,
    ]
      .join(' ')
      .toLowerCase()
      .includes(query),
  )
}, [users, search])
```

For the initial version, search is client-side. If the user list later becomes large, replace this with a debounced FastAPI query parameter such as `GET /users?search=alex`.

## 17. Add sorting

```tsx
function handleSort(column: UserSortKey) {
  if (column === sortKey) {
    setSortDirection((current) =>
      current === 'ascending'
        ? 'descending'
        : 'ascending',
    )
    return
  }

  setSortKey(column)
  setSortDirection('ascending')
}

const visibleUsers = useMemo(() => {
  const copy = [...filteredUsers]

  copy.sort((left, right) => {
    const comparison = String(left[sortKey]).localeCompare(
      String(right[sortKey]),
      undefined,
      { numeric: true, sensitivity: 'base' },
    )

    return sortDirection === 'ascending'
      ? comparison
      : -comparison
  })

  return copy
}, [filteredUsers, sortKey, sortDirection])
```

Tremor Table supplies visual table primitives, but application sorting logic still belongs to `UsersPage`.

## 18. Build the Tremor table

Imports:

```tsx
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
  RiEditLine,
} from '@remixicon/react'
import { Button } from '../components/ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from '../components/ui/Table'
```

Create a small local heading helper:

```tsx
function SortableHeader({
  column,
  label,
}: {
  column: UserSortKey
  label: string
}) {
  const isActive = sortKey === column
  const SortIcon =
    sortDirection === 'ascending'
      ? RiArrowUpSLine
      : RiArrowDownSLine

  return (
    <TableHeaderCell
      aria-sort={isActive ? sortDirection : 'none'}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        onClick={() => handleSort(column)}
      >
        {label}
        {isActive && (
          <SortIcon className="size-4" aria-hidden="true" />
        )}
      </button>
    </TableHeaderCell>
  )
}
```

Table composition:

```tsx
<div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
  <TableRoot>
    <Table>
      <TableHead>
        <TableRow>
          <SortableHeader column="id" label="ID" />
          <SortableHeader column="email" label="Email" />
          <SortableHeader column="language" label="Language" />
          <SortableHeader column="currency" label="Currency" />
          <SortableHeader column="timezone" label="Timezone" />
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {visibleUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.language}</TableCell>
            <TableCell>{user.currency}</TableCell>
            <TableCell>{user.timezone}</TableCell>

            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => openEditDialog(user)}
                  aria-label={`Edit ${user.email}`}
                >
                  <RiEditLine className="size-4" aria-hidden="true" />
                  Edit
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDelete(user)}
                  className="text-red-400 hover:bg-red-950 hover:text-red-300"
                  aria-label={`Delete ${user.email}`}
                >
                  <RiDeleteBinLine
                    className="size-4"
                    aria-hidden="true"
                  />
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableRoot>
</div>
```

`TableRoot` provides horizontal scrolling on small screens. The outer application wrapper supplies the specific dark border and rounded container seen in the reference.

## 19. Handle loading, errors, and empty results

Loading:

```tsx
if (loading) {
  return (
    <div
      className="rounded-lg border border-gray-800 bg-gray-950 p-12 text-center text-sm text-gray-400"
      role="status"
    >
      Loading users...
    </div>
  )
}
```

Page error:

```tsx
if (pageError) {
  return (
    <div className="rounded-lg border border-red-900 bg-red-950/40 p-6 text-red-200">
      <p>{pageError}</p>
      <Button
        type="button"
        variant="secondary"
        onClick={() => void loadUsers()}
        className="mt-4"
      >
        Try again
      </Button>
    </div>
  )
}
```

Empty table body:

```tsx
{visibleUsers.length === 0 && (
  <TableRow>
    <TableCell colSpan={6} className="py-12 text-center text-gray-400">
      {search
        ? 'No users match your search.'
        : 'No users have been added yet.'}
    </TableCell>
  </TableRow>
)}
```

## 20. Build the Tremor Add/Edit dialog

Create `src/components/UserFormDialog.tsx`.

Props:

```tsx
type UserFormDialogProps = {
  mode: 'add' | 'edit'
  user: User | null
  open: boolean
  saving: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: UserInput) => Promise<void>
}
```

Imports:

```tsx
import { RiCloseLine } from '@remixicon/react'
import { Button } from './ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/Dialog'
import { Input } from './ui/Input'
import { SelectNative } from './ui/SelectNative'
```

Dialog composition:

```tsx
<Dialog
  open={open}
  onOpenChange={(nextOpen) => {
    if (!saving) {
      onOpenChange(nextOpen)
    }
  }}
>
  <DialogContent
    className="max-w-2xl bg-white text-gray-950 dark:bg-white"
  >
    <DialogHeader>
      <div>
        <DialogTitle className="text-2xl text-gray-950">
          {mode === 'add' ? 'Add user' : 'Edit user'}
        </DialogTitle>

        <DialogDescription className="mt-2 text-gray-500">
          Configure the user's basic account details.
        </DialogDescription>
      </div>

      <DialogClose asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={saving}
          aria-label="Close dialog"
          className="text-gray-600"
        >
          <RiCloseLine className="size-5" aria-hidden="true" />
        </Button>
      </DialogClose>
    </DialogHeader>

    <form onSubmit={handleSubmit}>
      {/* Form fields */}

      <DialogFooter>
        <DialogClose asChild>
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
          >
            Cancel
          </Button>
        </DialogClose>

        <Button type="submit" isLoading={saving}>
          {mode === 'add' ? 'Add user' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

Radix handles important dialog behavior such as:

- Rendering above the rest of the page
- Escape-to-close
- Focus trapping
- Returning focus after closing
- Dialog semantics for assistive technology

The app still controls whether the dialog is open through React state.

## 21. Build the Tremor form

Create initial state:

```tsx
const EMPTY_FORM: UserInput = {
  email: '',
  language: '',
  currency: '',
  timezone: '',
}

const [form, setForm] = useState<UserInput>(
  user
    ? {
        email: user.email,
        language: user.language,
        currency: user.currency,
        timezone: user.timezone,
      }
    : EMPTY_FORM,
)
```

Reusable field updater:

```tsx
function updateField(
  field: keyof UserInput,
  value: string,
) {
  setForm((current) => ({
    ...current,
    [field]: value,
  }))
}
```

Form layout:

```tsx
<div className="grid gap-5 py-6 sm:grid-cols-2">
  <label className="grid gap-2 sm:col-span-2">
    <span className="text-sm font-medium text-gray-900">
      Email
    </span>

    <Input
      type="email"
      value={form.email}
      placeholder="name@company.com"
      required
      disabled={saving}
      onChange={(event) =>
        updateField('email', event.target.value)
      }
    />
  </label>

  <label className="grid gap-2">
    <span className="text-sm font-medium text-gray-900">
      Language
    </span>

    <SelectNative
      value={form.language}
      required
      disabled={saving}
      onChange={(event) =>
        updateField('language', event.target.value)
      }
    >
      <option value="">Select a language</option>
      <option value="en">English</option>
      <option value="de">German</option>
      <option value="es">Spanish</option>
    </SelectNative>
  </label>

  <label className="grid gap-2">
    <span className="text-sm font-medium text-gray-900">
      Currency
    </span>

    <SelectNative
      value={form.currency}
      required
      disabled={saving}
      onChange={(event) =>
        updateField('currency', event.target.value)
      }
    >
      <option value="">Select a currency</option>
      <option value="USD">USD - US Dollar</option>
      <option value="EUR">EUR - Euro</option>
      <option value="PHP">PHP - Philippine Peso</option>
    </SelectNative>
  </label>

  <label className="grid gap-2 sm:col-span-2">
    <span className="text-sm font-medium text-gray-900">
      Timezone
    </span>

    <Input
      type="text"
      value={form.timezone}
      placeholder="Asia/Manila"
      required
      disabled={saving}
      onChange={(event) =>
        updateField('timezone', event.target.value)
      }
    />
  </label>
</div>
```

The options are examples. Replace them with values accepted by FastAPI.

Form error:

```tsx
{error && (
  <div
    role="alert"
    className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
  >
    {error}
  </div>
)}
```

Submit handler:

```tsx
async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>,
) {
  event.preventDefault()

  await onSubmit({
    email: form.email.trim(),
    language: form.language.trim(),
    currency: form.currency.trim(),
    timezone: form.timezone.trim(),
  })
}
```

## 22. Connect create and update

Dialog controls in `UsersPage`:

```tsx
function openAddDialog() {
  setSelectedUser(null)
  setFormError(null)
  setDialogMode('add')
}

function openEditDialog(user: User) {
  setSelectedUser(user)
  setFormError(null)
  setDialogMode('edit')
}

function handleDialogOpenChange(open: boolean) {
  if (!open && !saving) {
    setDialogMode(null)
    setSelectedUser(null)
    setFormError(null)
  }
}
```

Save handler:

```tsx
async function handleSave(input: UserInput) {
  setSaving(true)
  setFormError(null)

  try {
    if (dialogMode === 'add') {
      await createUser(input)
    } else if (dialogMode === 'edit' && selectedUser) {
      await updateUser(selectedUser.id, input)
    }

    await loadUsers()
    setDialogMode(null)
    setSelectedUser(null)
  } catch (error) {
    setFormError(
      error instanceof Error
        ? error.message
        : 'Unable to save user',
    )
  } finally {
    setSaving(false)
  }
}
```

Render the dialog:

```tsx
{dialogMode && (
  <UserFormDialog
    key={`${dialogMode}-${selectedUser?.id ?? 'new'}`}
    mode={dialogMode}
    user={selectedUser}
    open={true}
    saving={saving}
    error={formError}
    onOpenChange={handleDialogOpenChange}
    onSubmit={handleSave}
  />
)}
```

The `key` ensures the form receives fresh initial state when switching between users or opening a new Add form.

Refetching after a successful mutation is deliberately simple. It ensures the table displays the authoritative backend data.

## 23. Connect delete

Keep the first delete flow simple:

```tsx
async function handleDelete(user: User) {
  const confirmed = window.confirm(
    `Delete ${user.email}? This action cannot be undone.`,
  )

  if (!confirmed) {
    return
  }

  setPageError(null)

  try {
    await deleteUser(user.id)
    await loadUsers()
  } catch (error) {
    setPageError(
      error instanceof Error
        ? error.message
        : 'Unable to delete user',
    )
  }
}
```

Do not add a second Tremor Dialog for delete until the main CRUD flow works. A custom confirmation dialog is an optional refinement.

## 24. Define the eSIM contract

The requested overview has exactly three data columns: ID, User, and IMSI. Use a separate input type so the frontend cannot send an editable ID.

Update the existing `src/types/esims.ts`:

```ts
export type Esim = {
  id: number
  user: string
  imsi: string
}

export type EsimInput = {
  user: string
  imsi: string
}

export type EsimSortKey = 'id' | 'user' | 'imsi'
```

Field meanings:

| Field | Purpose |
| --- | --- |
| `id` | Backend-generated identifier used by update and delete routes. Display it, but never include it in Add/Edit form input. |
| `user` | User email displayed in the **User** column and sent to the REST API. |
| `imsi` | International Mobile Subscriber Identity. Keep it as a string so it is never reformatted or treated as a number. |

The `user` email field is confirmed. Before implementation, confirm the remaining contract details:

- Whether the existing numeric ID assumption matches FastAPI.
- Whether FastAPI requires the email to match an existing user and whether matching is case-insensitive.
- Whether IMSI may be edited after creation.
- The backend's IMSI length, character, and uniqueness rules.
- Whether update uses `PATCH` or `PUT` and whether it expects a complete or partial body.
- Whether list endpoints return arrays or paginated objects.

Keep `user` typed as a string and IMSI typed as a string. Do not weaken either field to `any`, and do not introduce user-ID mapping into the table or API client.

## 25. Create the eSIM API client

Create `src/api/esims.ts` and reuse `request()` from `src/api/request.ts`:

```ts
import type { Esim, EsimInput } from '../types/esims'
import { request } from './request'

export function listEsims(): Promise<Esim[]> {
  return request<Esim[]>('/esims')
}

export function createEsim(input: EsimInput): Promise<Esim> {
  return request<Esim>('/esims', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateEsim(
  id: number,
  input: EsimInput,
): Promise<Esim> {
  return request<Esim>(`/esims/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteEsim(id: number): Promise<void> {
  return request<void>(`/esims/${id}`, {
    method: 'DELETE',
  })
}
```

These four functions are the only eSIM persistence boundary in the frontend:

| UI operation | REST call |
| --- | --- |
| Open or refresh the overview | `listEsims()` → `GET /esims` |
| Add eSIM | `createEsim()` → `POST /esims` |
| Edit eSIM | `updateEsim()` → `PATCH /esims/{id}` |
| Delete eSIM | `deleteEsim()` → `DELETE /esims/{id}` |

No component may import a database SDK, use database credentials, query tables, or call persistence services directly. The browser calls FastAPI only. The API performs database access, authorization, validation, and conflict handling. If OpenAPI uses different methods, paths, or response envelopes, update this small client without leaking transport details into UI components.

## 26. Create the eSIM page state

Create `src/pages/EsimsPage.tsx`. It owns orchestration state; the table, form dialog, and API client remain focused components/modules.

The page loads eSIMs plus user options for the Add/Edit selector. Under the current provisional contract, each eSIM already contains the email displayed in the User column:

```tsx
import { useEffect, useMemo, useState } from 'react'
import type {
  Esim,
  EsimInput,
  EsimSortKey,
} from '../types/esims'
import type { SortDirection } from '../types/sort'
import type { User } from '../types/user'
import {
  createEsim,
  deleteEsim,
  listEsims,
  updateEsim,
} from '../api/esims'
import { listUsers } from '../api/users'

type DialogMode = 'add' | 'edit' | null

export function EsimsPage() {
  const [esims, setEsims] = useState<Esim[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<EsimSortKey>('imsi')
  const [sortDirection, setSortDirection] =
    useState<SortDirection>('ascending')

  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [dialogMode, setDialogMode] =
    useState<DialogMode>(null)
  const [selectedEsim, setSelectedEsim] =
    useState<Esim | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formError, setFormError] =
    useState<string | null>(null)

  // Loading, derived data, and CRUD functions follow.
}
```

Load both REST resources in parallel because the form selector needs current users. The eSIM response itself supplies the table's displayable User value under the provisional contract.

```tsx
async function loadPageData() {
  setLoading(true)
  setPageError(null)

  try {
    const [esimResult, userResult] = await Promise.all([
      listEsims(),
      listUsers(),
    ])

    setEsims(esimResult)
    setUsers(userResult)
  } catch (error) {
    setPageError(
      error instanceof Error
        ? error.message
        : 'Unable to load eSIMs',
    )
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  void loadPageData()
}, [])
```

The page must render explicit states:

- Initial load: a `role="status"` message or skeleton saying “Loading eSIMs…”.
- Load failure: a readable `role="alert"` message and a **Try again** button that calls `loadPageData()`.
- Empty list: “No eSIMs have been added yet.”
- Empty search result: “No eSIMs match your search.”
- Save: loading state on the dialog submit button, with close and duplicate submission disabled.
- Delete: loading state on only the affected row, with duplicate deletion disabled.

Do not show a stale empty table while the first request is loading or silently replace request errors with an empty state. `esim.user` is already the displayable email, so the table needs no relationship lookup or fallback label transformation.

## 27. Add eSIM search and sorting

Use Tremor Input in the eSIM toolbar:

```tsx
<Input
  type="search"
  icon={RiSearchLine}
  value={search}
  placeholder="Search by ID, user, or IMSI..."
  aria-label="Search eSIMs"
  onChange={(event) => setSearch(event.target.value)}
  className="w-full sm:max-w-md"
/>
```

Search every displayed data value:

```tsx
const filteredEsims = useMemo(() => {
  const query = search.trim().toLowerCase()

  if (!query) {
    return esims
  }

  return esims.filter((esim) =>
    [esim.id, esim.user, esim.imsi]
      .join(' ')
      .toLowerCase()
      .includes(query),
  )
}, [esims, search])
```

Sorting handler:

```tsx
function handleSort(column: EsimSortKey) {
  if (column === sortKey) {
    setSortDirection((current) =>
      current === 'ascending'
        ? 'descending'
        : 'ascending',
    )
    return
  }

  setSortKey(column)
  setSortDirection('ascending')
}
```

Sort the displayed string values with locale-aware numeric comparison:

```tsx
const visibleEsims = useMemo(() => {
  const copy = [...filteredEsims]

  copy.sort((left, right) => {
    const comparison = String(left[sortKey]).localeCompare(
      String(right[sortKey]),
      undefined,
      { numeric: true, sensitivity: 'base' },
    )

    return sortDirection === 'ascending'
      ? comparison
      : -comparison
  })

  return copy
}, [filteredEsims, sortKey, sortDirection])
```

Each sortable header must expose the actual state with `aria-sort` and a visible direction icon. For a large inventory, move eSIM search, sorting, and pagination to FastAPI. The client-side version is appropriate only when `GET /esims` returns a manageable list.

## 28. Build the Tremor eSIM table

Create `src/components/EsimTable.tsx` with the existing Tremor Table primitives. Keep it resource-specific and presentational: it receives the visible eSIMs, sort state, delete state, and edit/delete/sort callbacks. `EsimsPage` retains fetching, search, mutations, and dialog state. This provides useful component reuse without introducing a generic schema-driven table for unrelated resources.

Page header and toolbar:

```tsx
<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="text-2xl font-semibold text-white">eSIMs</h1>
    <p className="mt-2 text-sm text-gray-400">
      View and manage all eSIM records.
    </p>
  </div>

  <Button type="button" onClick={openAddDialog}>
    <RiAddLine className="size-4" aria-hidden="true" />
    Add eSIM
  </Button>
</header>

<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  {/* Tremor search Input */}
  <span className="text-sm text-gray-400">
    {visibleEsims.length} eSIMs
  </span>
</div>
```

Table:

```tsx
<div className="mt-4 overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
  <TableRoot>
    <Table>
      <TableHead>
        <TableRow>
          <SortableEsimHeader column="id" label="ID" />
          <SortableEsimHeader column="user" label="User" />
          <SortableEsimHeader column="imsi" label="IMSI" />
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {visibleEsims.map((esim) => (
          <TableRow key={esim.id}>
            <TableCell>{esim.id}</TableCell>
            <TableCell>{esim.user}</TableCell>
            <TableCell className="font-mono">{esim.imsi}</TableCell>

            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={deletingId === esim.id}
                  onClick={() => openEditDialog(esim)}
                  aria-label={`Edit eSIM ${esim.imsi}`}
                >
                  <RiEditLine className="size-4" aria-hidden="true" />
                  Edit
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  isLoading={deletingId === esim.id}
                  disabled={deletingId !== null}
                  onClick={() => void handleDelete(esim)}
                  className="text-red-400 hover:bg-red-950 hover:text-red-300"
                  aria-label={`Delete eSIM ${esim.imsi}`}
                >
                  <RiDeleteBinLine
                    className="size-4"
                    aria-hidden="true"
                  />
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}

        {visibleEsims.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={4}
              className="py-12 text-center text-gray-400"
            >
              {search
                ? 'No eSIMs match your search.'
                : 'No eSIMs have been added yet.'}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableRoot>
</div>
```

Only ID, User, and IMSI are eSIM data columns. Actions is a control column, not an additional eSIM field. Keep IDs and IMSIs untruncated where possible; if space is constrained, allow horizontal scrolling and provide the full value accessibly instead of losing information.

## 29. Build the Tremor eSIM form dialog

Create `src/components/EsimFormDialog.tsx`.

Props:

```tsx
type EsimFormDialogProps = {
  mode: 'add' | 'edit'
  esim: Esim | null
  users: User[]
  open: boolean
  saving: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: EsimInput) => Promise<void>
}
```

Initial form state contains only editable API input:

```tsx
const EMPTY_ESIM_FORM: EsimInput = {
  user: '',
  imsi: '',
}

const [form, setForm] = useState<EsimInput>(
  esim
    ? { user: esim.user, imsi: esim.imsi }
    : EMPTY_ESIM_FORM,
)

const [fieldErrors, setFieldErrors] = useState<
  Partial<Record<keyof EsimInput, string>>
>({})
```

Perform basic client-side validation before calling the API:

```tsx
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()

  const user = form.user.trim()
  const imsi = form.imsi.trim()
  const errors: Partial<Record<keyof EsimInput, string>> = {}

  if (!user) {
    errors.user = 'Select a user.'
  }

  if (!imsi) {
    errors.imsi = 'IMSI is required.'
  } else if (!/^\d+$/.test(imsi)) {
    errors.imsi = 'IMSI must contain digits only.'
  }

  setFieldErrors(errors)

  if (Object.keys(errors).length > 0) {
    return
  }

  await onSubmit({ user, imsi })
}
```

Compose the same Tremor Dialog primitives used for Users:

```tsx
<Dialog open={open} onOpenChange={handleOpenChange}>
  <DialogContent className="max-w-2xl bg-white text-gray-950 dark:bg-white">
    <DialogHeader>
      <DialogTitle className="text-2xl text-gray-950">
        {mode === 'add' ? 'Add eSIM' : 'Edit eSIM'}
      </DialogTitle>
      <DialogDescription className="mt-2 text-gray-500">
        Select the user and enter the IMSI.
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 py-6 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-gray-900">User</span>
          <SelectNative
            value={form.user}
            required
            disabled={saving}
            aria-invalid={Boolean(fieldErrors.user)}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                user: event.target.value,
              }))
            }
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.email}>
                {user.email}
              </option>
            ))}
          </SelectNative>
          {fieldErrors.user && (
            <span className="text-sm text-red-600">
              {fieldErrors.user}
            </span>
          )}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-gray-900">IMSI</span>
          <Input
            value={form.imsi}
            inputMode="numeric"
            autoComplete="off"
            placeholder="310150123456789"
            required
            disabled={saving}
            aria-invalid={Boolean(fieldErrors.imsi)}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                imsi: event.target.value,
              }))
            }
          />
          {fieldErrors.imsi && (
            <span className="text-sm text-red-600">
              {fieldErrors.imsi}
            </span>
          )}
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary" disabled={saving}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" isLoading={saving} disabled={saving}>
          {mode === 'add' ? 'Add eSIM' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

`inputMode="numeric"` only suggests a mobile keyboard; the explicit digit check performs the basic browser validation. FastAPI must still validate the user, exact IMSI format, length, uniqueness, authorization, and any create/update constraints. If the API permits an unassigned eSIM, change `user` to `string | null`, add an Unassigned option, and update the validation and display fallback together.

## 30. Connect eSIM CRUD

Dialog controls:

```tsx
function openAddDialog() {
  setSelectedEsim(null)
  setFormError(null)
  setDialogMode('add')
}

function openEditDialog(esim: Esim) {
  setSelectedEsim(esim)
  setFormError(null)
  setDialogMode('edit')
}

function handleDialogOpenChange(open: boolean) {
  if (!open && !saving) {
    setDialogMode(null)
    setSelectedEsim(null)
    setFormError(null)
  }
}
```

Create/update handler:

```tsx
async function handleSave(input: EsimInput) {
  setSaving(true)
  setFormError(null)

  try {
    if (dialogMode === 'add') {
      await createEsim(input)
    } else if (dialogMode === 'edit' && selectedEsim) {
      await updateEsim(selectedEsim.id, input)
    }

    await loadPageData()
    setDialogMode(null)
    setSelectedEsim(null)
  } catch (error) {
    setFormError(
      error instanceof Error
        ? error.message
        : 'Unable to save eSIM',
    )
  } finally {
    setSaving(false)
  }
}
```

Delete handler:

```tsx
async function handleDelete(esim: Esim) {
  const confirmed = window.confirm(
    `Delete eSIM ${esim.imsi}? This action cannot be undone.`,
  )

  if (!confirmed) {
    return
  }

  setDeletingId(esim.id)
  setPageError(null)

  try {
    await deleteEsim(esim.id)
    await loadPageData()
  } catch (error) {
    setPageError(
      error instanceof Error
        ? error.message
        : 'Unable to delete eSIM',
    )
  } finally {
    setDeletingId(null)
  }
}
```

Render the form:

```tsx
{dialogMode && (
  <EsimFormDialog
    key={`${dialogMode}-${selectedEsim?.id ?? 'new'}`}
    mode={dialogMode}
    esim={selectedEsim}
    users={users}
    open={true}
    saving={saving}
    error={formError}
    onOpenChange={handleDialogOpenChange}
    onSubmit={handleSave}
  />
)}
```

After every successful mutation, reload through `GET /esims` so the table reflects the authoritative backend. Keep the dialog open and preserve entered values after a failed save. Surface readable API errors for duplicate IMSIs, invalid users, validation failures, authorization failures, conflicts, and unavailable services. The frontend validation improves feedback but never replaces backend enforcement.

### Add development mocks and component coverage

The current MSW setup handles Users only, so the eSIM page would fail in the repository's default mock-development mode unless eSIM handlers are added.

Add:

- `src/mocks/data/esims.ts` with deterministic ID/User/IMSI records whose User emails exist in `mockUsers`.
- `src/mocks/handlers/esims.ts` with `GET /esims`, `POST /esims`, `PATCH /esims/:id`, and `DELETE /esims/:id` handlers.
- `resetMockEsims()` following the existing `resetMockUsers()` pattern so stories remain isolated.
- eSIM validation responses for missing User, unknown User, missing or non-digit IMSI, duplicate IMSI, and unknown IDs.

Update `src/mocks/handlers.ts` to export both handler groups. `src/mocks/browser.ts` can continue consuming that combined list. Update `.storybook/preview.tsx` to install both groups and reset both in `beforeEach`.

Add Storybook coverage consistent with the current Users feature:

- `EsimsPage.stories.tsx`: Populated, Empty, Loading, and Error, plus a filtered-empty interaction if interaction tests are used.
- `EsimTable.stories.tsx`: populated rows, empty rows, long ID/IMSI values, active sort direction, and deleting-row state.
- `EsimFormDialog.stories.tsx`: Add, Edit, Saving, inline validation, and API error states.
- `App.stories.tsx`: an interaction that selects eSIMs and confirms the real overview replaces the placeholder.

The mock implementation is for development and Storybook only. Production behavior must still go through the same REST client and must never import mock state or access a database directly.

## 31. Match the visual references

Use the screenshots as layout and visual direction, not as requirements to copy unrelated features.

### Dashboard reference

Use:

- Gray-950/navy background
- Approximately 240px sidebar
- Indigo active navigation
- Thin gray-800 borders
- Full-width table
- Muted gray secondary text
- Compact row actions

Do not add:

- Workspace selector
- Overview and Settings pages
- Shortcut links
- Export or View controls
- Row-selection checkboxes
- Region, Stability, Cost, or Last Edited columns

The eSIM table contains only the requested ID, User, and IMSI data columns plus Actions. Do not add speculative lifecycle or billing fields.

### Dialog reference

Use:

- Dimmed backdrop
- Large white dialog
- Rounded corners
- Clear title and description
- Comfortable field spacing
- Two columns on desktop
- One column on mobile
- Cancel and primary submit actions

Do not add the screenshot's account, tax, credit, billing, or rate-plan fields.

### Application-specific Tailwind classes

Tremor supplies component styling, but page layout still uses small utility groups:

```tsx
// Page container
className="mx-auto w-full max-w-7xl"

// Header
className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"

// Toolbar
className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"

// Table spacing
className="mt-4"

// Responsive form
className="grid gap-5 sm:grid-cols-2"
```

This is substantially less custom styling than the plain-CSS approach, but it is not zero styling.

## 32. Responsive behavior

The planned responsive rules are expressed through Tailwind breakpoints:

| Screen size | Behavior |
| --- | --- |
| Mobile | Sidebar becomes a top section; navigation is horizontal; both tables scroll; dialog fields use one column. |
| `sm` and above | Header and toolbar become horizontal; dialog uses two columns. |
| `md` and above | Sidebar and content become two grid columns. |

Examples:

```tsx
// One column by default, sidebar column from md upward
className="min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]"

// Vertical on mobile, horizontal from sm upward
className="flex flex-col gap-4 sm:flex-row sm:items-center"

// One form column on mobile, two from sm upward
className="grid gap-5 sm:grid-cols-2"
```

The Tremor `TableRoot` already provides a scrollable wrapper, so the table does not need custom media-query CSS.

## 33. Accessibility

Tremor and Radix provide useful foundations, but application code still has responsibilities.

Implement:

- Semantic `<main>`, `<aside>`, and `<nav>` elements.
- Visible labels for every form control.
- `aria-current="page"` for active navigation.
- `aria-sort` for sortable table headings.
- Descriptive user action labels containing the user email.
- Descriptive eSIM action labels containing the IMSI.
- `role="alert"` for mutation errors.
- `role="status"` for loading messages.
- Visible keyboard focus.
- Disabled submit and close actions while saving.
- Sufficient color contrast.

Radix Dialog should handle focus trapping, Escape, and focus restoration. Verify these behaviors rather than assuming they work after customization.

## 34. Implementation sequence

The shell, sidebar, Tremor primitives, dependencies, Tailwind configuration, and Users CRUD page are already implemented. Complete only the remaining work, in this order:

1. Confirm the FastAPI eSIM paths, methods, response envelope, ID type, and IMSI validation rules; `user` is already confirmed as the user email.
2. Move the existing `API_BASE_URL` and `request()` implementation from `src/api/users.ts` to `src/api/request.ts`; update Users to import it without changing existing behavior.
3. Move `SortDirection` from `src/types/user.ts` to `src/types/sort.ts` and update `UsersPage.tsx` to import it from the shared module.
4. Retain the existing ID/User/IMSI shape in `src/types/esims.ts`, with `user` as the email string, and align the exported type names consistently.
5. Add `src/api/esims.ts` with typed list, create, update, and delete functions that use the shared REST helper.
6. Add deterministic eSIM mock data and MSW CRUD handlers, including invalid User, invalid IMSI, duplicate IMSI, not-found, and delete responses.
7. Register the eSIM handlers in `src/mocks/handlers.ts` and reset eSIM state alongside Users in Storybook.
8. Build `EsimFormDialog` with reusable Add/Edit state, a User selector backed by `listUsers()`, IMSI validation, disabled controls while saving, and inline API errors.
9. Build the presentational `EsimTable` with ID/User/IMSI columns, accessible sort controls, edit/delete actions, empty results, and row-level delete loading.
10. Build `EsimsPage` to load the necessary REST resources, derive search/sort results, orchestrate the dialog and mutations, and render loading/error/retry states.
11. Replace the eSIM placeholder in `App.tsx` with `EsimsPage`; retain the existing sidebar state and responsive shell.
12. Add `EsimFormDialog`, `EsimTable`, and `EsimsPage` stories. Cover populated, empty, filtered-empty, loading, list error, save error, and delete error behavior.
13. Verify keyboard interaction, dialog focus behavior, `aria-sort`, `role="status"`, `role="alert"`, narrow-screen table scrolling, and one-column mobile forms.
14. Run lint, a no-emit typecheck, the Storybook tests, and the production build.
15. Update README mock/API documentation and remove its stale “add esims page” TODO.

No new package installation is expected; all required Tremor, Radix, Tailwind, MSW, Storybook, Vitest, and Playwright dependencies are already present.

Running the development server:

```bash
npm run dev
```

Final checks:

```bash
npm run lint
npm run build
```

## 35. Verification checklist

### Tremor setup

- [ ] Only required dependencies were installed.
- [ ] No `@tremor/react` package was added accidentally.
- [ ] Tremor Raw component source is stored under `components/ui`.
- [ ] Component utility imports resolve correctly.
- [ ] Tailwind Forms loads correctly.
- [ ] Dialog animations compile.
- [ ] Dark variants apply inside the dashboard.

### Navigation

- [ ] Users is selected initially.
- [ ] The active sidebar item is visually distinct.
- [ ] eSIMs displays the real eSIM management page.
- [ ] Navigation works on desktop and mobile.

### User list and table

- [ ] `GET /users` loads on page entry.
- [ ] Loading, error, retry, and empty states work.
- [ ] All requested columns are displayed.
- [ ] Long IDs and emails do not break the page.
- [ ] The table scrolls horizontally on narrow screens.

### User search and sorting

- [ ] Search checks every visible user field.
- [ ] Search is case-insensitive.
- [ ] Search displays a no-results row.
- [ ] Each header sorts ascending and descending.
- [ ] Sort indicators and `aria-sort` match the actual order.

### User Add and Edit dialog

- [ ] Add opens an empty form.
- [ ] Edit opens the correct prefilled user.
- [ ] Email uses `type="email"`.
- [ ] All required fields are enforced.
- [ ] Submit shows the Tremor Button loading state.
- [ ] The dialog stays open after a failed request.
- [ ] Entered values remain after a failed request.
- [ ] Escape closes the dialog while it is not saving.
- [ ] Focus returns to the trigger after closing.

### User deletion

- [ ] Delete confirmation includes the user email.
- [ ] Cancel sends no request.
- [ ] Confirm deletes the correct ID.
- [ ] The list reloads after success.
- [ ] Failure displays a readable message.

### eSIM list and table

- [ ] `EsimTable` remains presentational while `EsimsPage` owns REST and orchestration state.
- [ ] `GET /esims` loads when the eSIM page opens.
- [ ] Loading, failure, retry, and empty eSIM states work.
- [ ] ID, User, IMSI, and Actions are displayed; no speculative data columns are added.
- [ ] User displays the email returned in `esim.user` without an ID lookup or object conversion.
- [ ] Long IMSIs and IDs do not break the page.
- [ ] The eSIM table scrolls horizontally on narrow screens.

### eSIM search and sorting

- [ ] Search covers ID, the User email, and IMSI.
- [ ] ID, User, and IMSI sort in both directions.
- [ ] User sorting uses the displayed email.
- [ ] Sort indicators and `aria-sort` match the real order.

### eSIM Add and Edit dialog

- [ ] Add starts with empty User and IMSI fields.
- [ ] Edit opens the correct eSIM and prefills User and IMSI.
- [ ] ID is displayed in the table but is never editable or included in form input.
- [ ] IMSI remains a string and preserves leading zeroes.
- [ ] User email is required.
- [ ] The User selector lists current users loaded through the REST API.
- [ ] Empty or non-digit IMSIs show inline validation and send no request.
- [ ] Save displays a loading state and blocks duplicate submission.
- [ ] Backend validation errors remain visible inside the dialog.

### eSIM CRUD and deletion

- [ ] Add sends `POST /esims` with only the confirmed User and IMSI fields.
- [ ] Edit sends the confirmed update method to `/esims/{id}`.
- [ ] Delete confirmation contains the IMSI.
- [ ] Delete shows a row-level loading state and blocks duplicate deletion.
- [ ] Successful changes reload the authoritative eSIM list.
- [ ] Failed creates, updates, and deletes show readable API errors.

### eSIM mocks and Storybook

- [ ] Mock records use the confirmed ID/User/IMSI shape and reference valid mock users.
- [ ] MSW handles eSIM GET, POST, PATCH/PUT, and DELETE without bypassing to a real backend.
- [ ] Mock state resets between Storybook stories.
- [ ] Populated, empty, loading, list-error, validation-error, and deletion states are covered.
- [ ] App navigation renders the real eSIM page in Storybook.

### FastAPI integration

- [ ] Base URL comes from `VITE_API_BASE_URL`.
- [ ] FastAPI allows the Vite origin through CORS.
- [ ] Request methods and paths match OpenAPI.
- [ ] Payload fields match Pydantic models.
- [ ] eSIM ID type, `user` email field, and IMSI rules match OpenAPI.
- [ ] Load, create, update, and delete all go through the REST API.
- [ ] No frontend module imports a database SDK, embeds database credentials, or queries tables directly.
- [ ] Validation errors are readable.
- [ ] `204 No Content` does not cause a JSON parsing error.

### Quality

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] No unused starter imports remain.
- [ ] `.env` is not committed.
- [ ] README documents setup and expected endpoints.

## 36. Official references

The component APIs and dependency notes in this plan should be checked against the official documentation at implementation time:

- [Tremor Vite installation](https://www.tremor.so/docs/getting-started/installation/vite)
- [Tremor Button](https://www.tremor.so/docs/ui/button)
- [Tremor Dialog](https://www.tremor.so/docs/ui/dialog)
- [Tremor Input](https://www.tremor.so/docs/inputs/input)
- [Tremor Select Native](https://www.tremor.so/docs/inputs/select-native)
- [Tremor Table](https://www.tremor.so/docs/ui/table)
- [Tremor GitHub repository](https://github.com/tremorlabs/tremor)

Tremor component source and installation requirements can change. Copy the current official source instead of treating the abbreviated examples in this plan as the canonical component implementations.
