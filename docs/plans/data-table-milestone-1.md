# Data Table Milestone 1: Generic Columns and Feature Migration

Status: implementation plan, not implemented.

Prepared against the repository on September 13, 2026.

## Goal

Build a reusable column generator for any caller-supplied object row type, regardless of where that type is declared or inferred. Migrate Accounts and eSIMs as the first consumers. A caller should usually declare only its displayed fields, their order, and a few presentation overrides.

Complete the steps in order. Each step includes files, implementation tasks, and checks. Run the relevant checks as you finish each step, rather than deferring all verification until the end.

This milestone delivers the column foundation. It does not establish production readiness for the complete table workflow.

## Scope

Included:

- Model-agnostic row contracts with type-checked field names and field-specific cell values.
- Shared labels, cell rendering, formatting, and selection columns.
- Native TanStack column definitions for exceptional cases.
- Migration of the two existing shared-table consumers.
- Stable row identity, correct checkbox interaction, visibility, and ordering.
- Focused type checks, Storybook interaction tests, and usage documentation.

Deferred to later work:

- Generated filter controls and their metadata.
- Server pagination, filtering, and sorting across the complete dataset.
- Export, edit, delete, permissions, and mutation workflows.
- Selection across records not loaded in the browser.
- Saved table preferences, virtualization, grouping UI, and runtime schema generation.
- Redesigning page loading, error, and retry behavior.
- Migrating Users or other features that do not currently use this shared table.

The current Accounts and eSIM pages fetch at most 100 records. This milestone preserves that behavior; client-side table operations cover only loaded records. Existing placeholder actions are not completed by this work and must not be described as release-ready.

## Design Decisions

1. Let each caller choose the row type. Accept an existing model, an API response type, a type inferred from a typed function, or a locally declared or projected view row. Shared table code must not know the type's source.
2. Use an explicit field allowlist checked against the chosen row shape. TypeScript cannot enumerate a type at runtime, and deriving columns from the first response row breaks empty datasets and exposes unintended fields.
3. Put application-specific choices beside their consumers, using `src/features/<feature>/table/columns.ts` for the current pages. Shared UI must not import feature models, API clients, or application schemas.
4. Use native TanStack options for sorting, hiding, headers, cells, and custom accessors. Add only a small configuration layer for selecting fields.
5. Preserve raw accessor values. Formatting changes cell output, not the values used by sorting or filtering.
6. Make static column arrays once, outside React components.
7. Require no additional runtime dependencies.
8. Do not require a common base model, `id`, `name`, or `balance`. Callers provide stable identity through `getRowId` when needed.

Use the installed TanStack v8 APIs. Its column helper supports typed accessors and display columns; custom accessor functions need stable column IDs. See the [TanStack column definitions guide](https://tanstack.com/table/v8/docs/guide/column-defs).

## Row Type Ownership

The contract is `data: TData[]` paired with columns for the same structural row shape. `TData` describes the actual objects passed to the table, not necessarily the objects returned by an API or stored in a feature model.

| Row source | Caller responsibility | Shared-table responsibility |
| --- | --- | --- |
| Existing model or generated API type | Pass the type and matching rows directly. | Check field keys and render configured columns. |
| Typed data-loading function | Derive the row type from its return type. | Accept it like any other row type. |
| Joined or transformed data | Map it in the caller and derive the type from the mapper's return value. | Work with the resulting fields without understanding the transformation. |
| Local in-memory objects | Declare a type or infer it from a typed collection. | Require no feature module or backend model. |
| Untyped external data | Validate and narrow it at the data boundary before rendering. | Do not pretend an assertion or generic argument validates runtime data. |

Keep runtime schemas and their libraries outside the shared table. If a caller already uses a schema, it can pass the schema's inferred TypeScript type; adding a schema dependency is not part of this milestone.

Model-agnostic means independent of the type's origin, not untyped. Avoid `any`, a universal `Record<string, unknown>` row, or a union of all feature models. Keep the concrete row type through accessors, cell callbacks, and `getRowId`.

TypeScript uses structural compatibility. Two types with different names but the same compatible shape may be accepted; tests should reject incompatible fields or nullability, not merely different model names.

## Target Caller API

These are examples of the API to implement, not existing exports.

```ts
// A caller-owned type with no feature model or required "id" field.
import { createColumns } from "@/shared/ui/data-table/column-factories"

type UsageRow = {
  recordKey: string
  label: string
  usedMb: number | null
}

export const usageColumns = createColumns<UsageRow>({
  fields: ["label", "usedMb"],
  overrides: {
    usedMb: { meta: { displayName: "Used MB" } },
  },
  selectable: true,
})
```

This caller passes `UsageRow[]` and `getRowId={(row) => row.recordKey}` to `DataTable`. Nothing in shared code needs to know where those rows originated.

```ts
// src/features/accounts/table/columns.ts
// Derive the row type from a typed API function without a direct model import.
import type { listAccounts } from "../api"
import { createColumns } from "@/shared/ui/data-table/column-factories"

type AccountRow = Awaited<ReturnType<typeof listAccounts>>[number]

export const accountColumns = createColumns<AccountRow>({
  fields: ["name", "balance"],
  selectable: true,
})
```

```ts
// Example of adding more eSIM fields after the initial migration.
import type { listEsims } from "../api"
import { createColumns } from "@/shared/ui/data-table/column-factories"

type EsimRow = Awaited<ReturnType<typeof listEsims>>[number]

export const esimColumns = createColumns<EsimRow>({
  fields: ["imsi", "name", "balance", "networkstatus"],
  overrides: {
    imsi: { meta: { displayName: "IMSI" } },
    networkstatus: { meta: { displayName: "Network Status" } },
    balance: {
      cell: ({ getValue }) => {
        const value = getValue() // number | null
        return value == null ? "-" : value.toFixed(2)
      },
    },
  },
  selectable: true,
})
```

For the initial migration, keep both pages at `name` and `balance`, matching their current configured columns. Exercise additional fields in stories first. Adding them to the actual page is a separate display decision.

The inferred aliases above are optional caller choices, not a new source requirement. Reusing `Account` or `Esim` directly remains valid. The current list functions return arrays; if a future function returns `{ items: Row[] }`, derive its row type from `items` instead.

When a caller actually needs a transformed shape, keep the mapper next to that caller:

```ts
type Reading = { sourceKey: string; totalMb: number | null }

const toUsageRow = (reading: Reading) => ({
  recordKey: reading.sourceKey,
  usedMb: reading.totalMb,
})

type ProjectedUsageRow = ReturnType<typeof toUsageRow>
// Configure createColumns<ProjectedUsageRow> and pass readings.map(toUsageRow).
```

Do not create a mapper that merely copies every field to meet a table requirement. For real mappings in React, preserve stable array references with `useMemo` when the input collection is unchanged. Formatting still belongs in cells; mapping is for changing the row shape or combining data.

## File Map

Paths below are relative to the repository root. Files marked "new" should be created during implementation, not assumed to exist today.

| File | Action and responsibility |
| --- | --- |
| `src/shared/ui/data-table/column-types.ts` | New: typed generator input and shared format configuration. |
| `src/shared/ui/data-table/column-factories.tsx` | Fill the existing empty file: generator and selection column. |
| `src/shared/ui/data-table/column-defaults.tsx` | New: common header, label helper, and default cell rendering. |
| `src/shared/ui/data-table/TanstackTable.d.ts` | Extend the existing metadata declaration. |
| `src/shared/ui/data-table/DataTable.tsx` | Wire shared defaults, native column types, and row IDs. |
| `src/shared/ui/data-table/DataColumnHeader.tsx` | Make the existing sorting control keyboard-accessible. |
| `src/shared/ui/data-table/DataTableViewOptions.tsx` | Reuse labels and keep ordering consistent with TanStack. |
| `src/shared/ui/data-table/DataTableBulkEditor.tsx` | Correct selection counts if false state entries are present. |
| `src/features/accounts/table/columns.ts` | New: caller-selected row type and Accounts field configuration. |
| `src/features/esims/table/columns.ts` | New: caller-selected row type and eSIM field configuration. |
| `src/features/<feature>/table/rows.ts` | Optional: real row transformations and inferred view-row types; unnecessary for the initial direct-data migrations. |
| `src/features/accounts/pages/AccountsPage.tsx` | Import Account columns and supply row identity. |
| `src/features/esims/pages/EsimsPage.tsx` | Import Esim columns and supply row identity. |
| `src/shared/ui/data-table/columns.tsx` | Remove after all imports have migrated. |
| `src/shared/ui/data-table/DataTable.stories.tsx` | New: reusable table behavior checks. |
| `tests/types/data-table.typecheck.tsx` | New: compile-time contract checks; never imported by the application. |
| `tsconfig.table-types.json` | New: isolated configuration for the type-check fixtures. |
| `src/shared/ui/data-table/README.md` | New: instructions for the next feature developer. |

## Step 1: Record the Starting Point

Purpose: understand the existing error and avoid confusing pre-existing failures with regressions.

1. Read the files in the map, plus `package.json`, `tsconfig.app.json`, and `vite.config.ts`.
2. Run `git status --short`. Preserve existing work, including changes to `EsimsPage.tsx` and the untracked factory file.
3. Run the baseline commands below and record failures in your implementation notes.
4. Open Accounts and eSIMs in the existing development environment. Record which columns and controls currently appear.
5. Confirm that shared `columns.tsx` imports `Account`, while eSIM data is `Esim[]`. Keep nullable feature fields as declared; changing the model to silence a table error is not the fix.

```sh
npm run build
npm run lint
npm run test-storybook
```

The repository currently has a Storybook Vitest project, not a general-purpose unit-test project. New ordinary `.test.ts` files will not automatically run through `test-storybook`.

Acceptance checks:

- [ ] Baseline failures and current behavior are recorded.
- [ ] No unrelated user changes have been reverted.
- [ ] The developer can explain why Account-specific columns cannot serve as generic eSIM columns.

## Step 2: Define the Generator's Type Contract

Files: `column-types.ts`, `tests/types/data-table.typecheck.tsx`, `tsconfig.table-types.json`.

Purpose: catch bad field names and cell formatters for any caller-owned object row before rendering anything.

1. Constrain the generator to `TData extends object` and define `FieldKey<TData>` as `Extract<keyof TData, string>`. The field-list API supports object rows with top-level string keys. Require no domain interface, index signature, or particular property.
2. Define the column collection type using `TableOptions<TData>["columns"]`. TanStack allows different value types in one collection; the row type must remain `TData`.
3. Define overrides as a mapped type: for each key `K`, its options must use `TData[K]`. Do not use `TData[keyof TData]` for every cell; that turns all values into a union and loses per-field inference.
4. Base each override on `Partial<Omit<AccessorFnColumnDef<TData, TData[K]>, "id" | "accessorFn">>`. The generator owns field identity and extraction. Feature code can override presentation and behavior.
5. Define an options object with `fields: readonly FieldKey<TData>[]`, optional `overrides`, and optional `selectable`, defaulting to `false`.
6. Allow valid row-field overrides even when a field is not selected; document that unused overrides have no effect. This keeps the initial API small.
7. Reserve the column ID `select` for the shared selection control. Reject a conflicting selected field when selection is enabled.

Suggested type shape:

```ts
import type { AccessorFnColumnDef, TableOptions } from "@tanstack/react-table"

export type FieldKey<TData extends object> = Extract<keyof TData, string>
export type TableColumns<TData extends object> = TableOptions<TData>["columns"]

export type FieldOverrides<TData extends object> = {
  [K in FieldKey<TData>]?: Partial<
    Omit<AccessorFnColumnDef<TData, TData[K]>, "id" | "accessorFn">
  >
}

export interface ColumnOptions<TData extends object> {
  fields: readonly FieldKey<TData>[]
  overrides?: FieldOverrides<TData>
  selectable?: boolean
}
```

Create a dedicated type-check config extending `tsconfig.app.json`. Override `include` to cover the type fixtures and `TanstackTable.d.ts`; imported source files will also be checked. Use `noEmit`, `strictNullChecks`, and `strictFunctionTypes`, and a separate build-info path if needed. Do not turn on repo-wide strictness as part of this change.

Add a `typecheck:table` package script running `tsc -p tsconfig.table-types.json`. If checking imported code reveals existing errors, record and address the relevant ones; do not weaken the fixture to make an expected error disappear.

Acceptance checks:

- [ ] `fields: ["usedMbb"]` fails for the independent `UsageRow` fixture.
- [ ] An unknown override key fails.
- [ ] A local row with no `id`, `name`, or `balance` works without feature imports.
- [ ] A row inferred from a typed loader or mapper retains its field types.
- [ ] Optional and nullable values remain optional and nullable in cell callbacks.
- [ ] Existing Account numeric fields and nullable eSIM fields still retain their correct types in migration fixtures.
- [ ] A formatter treating a number as a string fails.

Use `@ts-expect-error` immediately above expected failing expressions. An unused directive must fail the check, proving the error is still enforced. Finish the fixtures as the factory becomes available in Step 4.

## Step 3: Centralize Labels and Cell Rendering

Files: `TanstackTable.d.ts`, `column-defaults.tsx`, `DataColumnHeader.tsx`.

Purpose: make normal columns work without per-feature JSX.

1. Explicitly import `RowData` in `TanstackTable.d.ts` and retain module augmentation of `@tanstack/react-table`.
2. Make `meta.displayName` optional and retain `meta.className`.
3. Add optional `meta.format`. Start with `"auto"`, `"text"`, `"number"`, `"boolean"`, and `"date"`; default to `"auto"`. Leave filter metadata for the next milestone.
4. Add one `getColumnLabel` helper accepting a column ID and optional display name. Use it in headers and view options.
5. For fallback labels, split camelCase and underscores, then capitalize words. Use explicit labels for acronyms and unseparated names: `imsi` needs `IMSI`, and `networkstatus` needs `Network Status`.
6. Add `createDefaultColumn<TData extends object>()` returning `Partial<ColumnDef<TData, unknown>>`, with a header using `DataTableColumnHeader` and a cell using the shared renderer.
7. Give ordinary columns `enableHiding: true` and `enableSorting: true`. Feature overrides can turn these off; display columns must explicitly do so.
8. Replace the clickable sorting `div` with a native `button type="button"`, keeping the existing icons and styling. Keep a noninteractive label when `column.getCanSort()` is false.
9. Use `getCanSort()` for styling too; do not depend on whether a feature explicitly supplied `enableSorting`.

Recommended first-pass rendering policy:

| Value or format | Output and behavior |
| --- | --- |
| `null` or `undefined` | `-`; never use a truthiness check that also replaces zero or false. |
| String with `auto` | Original string, including identifiers and leading zeros. |
| Number with `auto` | Plain numeric text, preserving the current presentation. |
| Boolean with `auto` | `Yes` or `No`. |
| Explicit `number` | Use a shared `Intl.NumberFormat` instance; specify locale and precision policy in one place. |
| Explicit `date` | For ISO strings use `parseISO`, then `isValid` and `format` from `date-fns`; support valid `Date` values too. |
| Invalid date or unsupported object | `-`; require a custom cell for objects or arrays. |

For the initial date preset, use `yyyy-MM-dd` in the browser's local timezone and document that choice. A feature requiring UTC or a business timezone should supply a custom formatter. Do not guess dates from arbitrary strings or infer currency from a field name.

Do not add formatted values to the row objects. Chronological sorting for custom date strings requires a suitable native accessor or sorting function; the date cell preset alone does not provide that behavior.

Acceptance checks:

- [ ] A field without metadata has a readable header.
- [ ] Zero, false, null, and leading-zero identifiers render distinctly.
- [ ] Invalid dates do not throw.
- [ ] A custom cell takes precedence over the default renderer.
- [ ] Enter and Space activate sorting from the header button.

## Step 4: Implement the Generator and Selection Column

File: `column-factories.tsx`.

Purpose: translate the typed field list into ordinary TanStack columns.

1. Implement `createColumns<TData extends object>(options: ColumnOptions<TData>): TableColumns<TData>` using `createColumnHelper<TData>()`. This replaces the earlier proposed name `createFeatureColumns`; no compatibility alias is needed because the generator is not implemented yet.
2. Add an internal generic function for one field, with `K extends FieldKey<TData>`. Accept its matching override and return an accessor definition for `TData[K]`.
3. Use the accessor function `(row: TData) => row[key]`, with `id: key`. This avoids forcing a generic `keyof` through TanStack's deep-path string machinery.
4. Apply overrides while retaining generator-owned identity. Keep repeated headers and cells out of generated definitions so table defaults can supply them.
5. Iterate over `fields` in their declared order and look up each field's override. Reject duplicate IDs with a clear development-facing error.
6. Use a generic helper to preserve the relationship between `key` and `TData[K]` during iteration. Do not fix inference by asserting the final array to a different feature's `ColumnDef[]`.
7. Implement `createSelectColumn<TData extends object>()` with `columnHelper.display`, adapting the current checkboxes from shared `columns.tsx`. Use TanStack's `row.id`, not `row.original.id`, if the checkbox label needs a row identifier.
8. Give selection `id: "select"`, an explicit header and cell, and disable sorting, hiding, column filtering, and global filtering for it.
9. Prepend the selection definition only when `selectable` is true.
10. Return native definitions. Callers can append a column from `createColumnHelper<TData>()` for a computed value or custom action without extending the generator API.

Selection behavior:

- The header checkbox selects the current page, not all loaded pages.
- Read its checked and indeterminate states from the page-selection APIs, including `getIsSomePageRowsSelected()`.
- Pass the next checked boolean to `toggleAllPageRowsSelected` and `row.toggleSelected`; avoid toggle-only callbacks.
- Use `row.getCanSelect()` for the row checkbox's disabled state.
- Give the header and row checkboxes clear accessible labels.

TanStack provides page-selection APIs and supports application row IDs through `getRowId`. See the [row selection guide](https://tanstack.com/table/v8/docs/guide/row-selection).

For null-heavy data, do not assume automatic type detection knows the declared TypeScript type. Verify the current numeric columns with nulls first and throughout the dataset. Use a native per-field `sortingFn` override where inference is insufficient. Define a consistent null policy for any custom comparator and test both directions.

Acceptance checks:

- [ ] Columns are created with an empty data array; generation never inspects data.
- [ ] Field order is deterministic and duplicate IDs are rejected.
- [ ] `selectable: false` produces no utility column.
- [ ] Caller cell callbacks retain precise value types regardless of the row type's source.
- [ ] A native computed accessor can be appended with a unique explicit ID.
- [ ] Shared code imports no feature model, API client, or application schema.

## Step 5: Wire the Generic Table

Files: `DataTable.tsx`, and `DataTableBulkEditor.tsx` if selection counts need correction.

1. Use `TData extends object` in the table props and component to match the generator. Change the `columns` prop to `TableOptions<TData>["columns"]` while keeping `data: TData[]`. Keep the concrete type through the table; do not widen either prop to a universal row shape.
2. Add `getRowId?: TableOptions<TData>["getRowId"]` and pass it through to `useReactTable`. Do not implement a shared `row.id` fallback. TanStack can use index IDs when omitted, but every selectable or reorderable-data example in this milestone must supply stable caller-owned identity, including an example using `recordKey`.
3. Create a stable default definition with `React.useMemo(() => createDefaultColumn<TData>(), [])` and pass it as `defaultColumn`.
4. Keep the existing core, filtered, sorted, and pagination row models. Do not introduce another table-state library.
5. Treat the reserved `select` display column as the initial selection opt-in. Derive table selection enablement from its presence so configuration has one source of truth.
6. Only enable row-click selection and the selection command bar when selection is enabled. Respect `row.getCanSelect()`.
7. Prevent an interactive child click from also selecting its row. Add a row-handler guard for buttons, inputs, links, and relevant interactive roles, or consistently stop propagation in interactive cells. Test both mouse and keyboard checkbox behavior.
8. Compute the selection count from true entries in `rowSelection`; keys with false values are not selected rows.
9. Use the visible leaf-column count for empty-state `colSpan`, with a minimum of one.
10. Handle `header.isPlaceholder` and `header.colSpan` during rendering so native column definitions remain compatible with the header model.
11. Apply `aria-sort` to the appropriate leaf header cell based on TanStack sorting state.
12. Apply the narrow selection-cell width only to the selection column. The current `first:w-10` also compresses the first data column when selection is absent.

TanStack's `defaultColumn` merges shared defaults with individual column definitions. Treat metadata as a shallow value: keep fallback behavior in the renderers, or merge metadata explicitly when adding generator-level metadata. See the [table API](https://tanstack.com/table/v8/docs/api/core/table).

Acceptance checks:

- [ ] One checkbox click changes selection exactly once.
- [ ] Clicking a link or button inside a cell does not select the row.
- [ ] Nonselectable tables have no selection interaction or selection-width styling.
- [ ] Rows keep their identity when reordered or replaced with the same IDs.
- [ ] A row without an `id` property supports selection using a caller-supplied identity callback.
- [ ] Hiding a column does not break the empty-state layout.
- [ ] Sorting `2`, `10`, and `100` is numeric, independent of cell formatting.

## Step 6: Migrate Accounts, Then eSIMs

Files: both feature column files and their page components.

1. Choose the row contract at the Accounts caller. For the documented example, infer `AccountRow` from `listAccounts` as shown above; using the existing `Account` type directly is also valid. Create columns with `createColumns<AccountRow>`, fields `name` and `balance`, and selection enabled.
2. Update `AccountsPage.tsx` to import `accountColumns` from `../table/columns`.
3. Pass `getRowId={(row) => String(row.id)}` to its table. Define that callback outside the component if convenient.
4. Verify Accounts before migrating the second page.
5. Choose the eSIM caller's row contract in the same way and create the initial field list with `createColumns<EsimRow>`.
6. Update `EsimsPage.tsx` to use `esimColumns` and its row ID callback, working with the page's existing edits.
7. Keep fetching, loading, and error code unchanged unless a small adjustment is required to complete the integration.
8. Pass rows matching the chosen contract. For this direct-data migration, no mapper is needed. If a future caller projects data, colocate a mapper in its `table/rows.ts`, infer the row with `ReturnType<typeof mapper>`, and pass the mapped array to the table. Never declare a projected type while passing untransformed source rows.
9. Exercise additional eSIM fields in a story to verify the generator, rather than silently expanding the page's displayed fields.
10. Preserve the existing model nullability and avoid casts or duplicate interfaces that only disguise a mismatch. The shared table imposes no model migration.

Expected wiring:

```tsx
<DataTable
  data={esims}
  columns={esimColumns}
  getRowId={(row) => String(row.id)}
/>
```

Acceptance checks:

- [ ] Both pages keep their initial field order and data loading behavior.
- [ ] eSIM rows with null names or balances render successfully.
- [ ] Swapping Account columns into the eSIM fixture fails the dedicated type check.
- [ ] Row type selection and any mapping stay at the caller; shared code has no knowledge of either API.
- [ ] No new feature-level column assertion is needed.

## Step 7: Align View Options With Generated Columns

File: `DataTableViewOptions.tsx`.

Purpose: make shared defaults useful without introducing stale or conflicting ordering state.

1. Use `getColumnLabel` instead of asserting that `meta.displayName` is a string.
2. Get data from TanStack leaf columns. Use `getCanHide()` to decide which columns receive visibility controls.
3. Keep the existing Atlaskit drag-and-drop library, Radix popover, and checkbox components.
4. Prefer TanStack's column order as the source of truth. Derive displayed items from the current ordered leaf columns; retain local state only for transient drag previews, focus, and announcements.
5. On reorder, send a complete ID order to `table.setColumnOrder`. Keep selection fixed first and other nonmovable utility columns in their assigned positions. Reorder the movable subsequence rather than dropping fixed IDs from the order.
6. When the column definitions change, preserve the order of surviving IDs, remove missing IDs, and append new IDs in declaration order. Update labels as metadata changes.
7. Compare the resulting order before writing state. Do not run an unconditional state-setting effect on an array recreated every render.
8. Keep visibility state in TanStack. Hiding a field should not discard its order position.
9. Ensure the View trigger is available on small screens; it is currently hidden below the large breakpoint.
10. Provide keyboard move-up/move-down controls using the existing icon library and the same reorder callback. Disable boundary moves and retain focus and announcements after a move.

Acceptance checks:

- [ ] Ordinary fields can be hidden and shown; selection cannot.
- [ ] Labels are consistent between the header and View menu.
- [ ] Drag and keyboard reorder update the table and preserve fixed columns.
- [ ] A story replacing column definitions updates the menu without losing surviving user order.
- [ ] Rerendering does not cause a loop or reset column preferences.
- [ ] The View control works on desktop and mobile.

## Step 8: Complete Focused Verification

Files: `DataTable.stories.tsx`, type fixtures, and feature stories where needed.

Extend checks added during earlier steps. Use the installed Storybook `play` functions with `expect`, `userEvent`, and `within` from `storybook/test`; `UsersPage.stories.tsx` demonstrates the repository's pattern.

Use independent local row fixtures for shared-table tests, with no imports from feature models or APIs. Include `UsageRow` without an `id` field and a projected row inferred from a mapper. Keep Account/eSIM-specific checks in migration fixtures or feature stories. Use the existing MSW setup only when exercising a page's API request. Use deterministic fixture values and explicit locale settings where formatted output is asserted.

| Check | Test data or interaction | Expected result |
| --- | --- | --- |
| Typed keys | Misspelled field and override keys | TypeScript rejects both. |
| Typed cells | Number formatter on a string; unsafe nullable access | TypeScript rejects both. |
| Independent row source | Local `UsageRow` and a row inferred from a typed loader | Both work without feature model imports. |
| Projected rows | Mapper-return row type and mapped objects | Keys and cells use the projected shape, not the input shape. |
| Row type pairing | Structurally incompatible rows and columns; Account/eSIM regression fixture | TypeScript rejects incompatible shapes or nullability, regardless of type names. |
| Compatible types | Two separately named types with the same compatible shape | Accepted; no nominal model identity is required. |
| Empty data | No rows, declared columns present | Headers remain; empty message spans visible columns. |
| Nullable values | `null`, `undefined`, zero, false | Correct distinct output; no exception. |
| Numeric sorting | `2`, `10`, `100`, mixed nulls, leading null rows | Numeric order; null policy is consistent in both directions. |
| Custom cell | Formatted numeric output | Formatting overrides default; sorting still uses raw numbers. |
| Selection | Mouse click and keyboard Space | Exactly one state transition each. |
| Page selection | At least 21 rows at the current page size of 20 | Header selects the current page only; next page starts unselected. |
| Stable identity | Replace rows without an `id` property in a different order; use `recordKey` via `getRowId` | Selection remains attached to the same records. |
| Visibility | Hide and restore a data column | Header and body update together. |
| Ordering | Drag and keyboard move | Table and menu agree; utility columns remain fixed. |
| Changed columns | Add/remove a definition during a story | Menu updates; surviving order is retained. |
| Custom accessor | Native computed column with an explicit ID | Renders and sorts correctly without changing the generator. |
| Mobile | Narrow viewport | No overlapping controls; View remains reachable. |

Keep compile-time fixtures outside the application's import graph. Do not import a fixture containing deliberately invalid calls into Storybook or the browser app.

Run the final checks after implementation:

```sh
npm run typecheck:table
npm run build
npm run lint
npm run test-storybook
```

Inspect the new stories in the browser as well. Start the existing development or Storybook server only when implementing and manually checking the table; creating this plan does not require one.

Acceptance checks:

- [ ] Tests cover user behavior and type contracts, rather than only snapshotting generated objects.
- [ ] Every new failure is fixed or explicitly documented with its cause.
- [ ] Pre-existing failures are distinguished from regressions.
- [ ] No test claims that client pagination covers records beyond the fetched collection.

## Step 9: Remove the Old Definition and Document Usage

Files: old `columns.tsx` and new shared `README.md`.

1. Search for every import of `@/shared/ui/data-table/columns` and relative references to that module.
2. Remove the old Account-specific shared file only after its consumers have migrated.
3. Confirm no remaining shared-table source imports `@/features/...`, feature APIs, or application schemas, including relative imports. Shared stories must use independent row fixtures too.
4. Write a short README covering the examples below.
5. Review the final diff for unintended page changes, casts, duplicated defaults, and dependency churn.

Useful searches:

```sh
rg -n 'data-table/columns' src
rg -n '@/features/' src/shared/ui/data-table
git diff --check
git diff --stat
```

The shared README should show:

- A minimal field list using a local row type with no feature dependency.
- An existing model type as one supported option, alongside a type inferred from a loader.
- An optional caller-side mapper with its row type inferred from `ReturnType`; no mapping is needed for direct-data callers.
- A display-name override for an acronym.
- A nullable numeric cell override.
- An explicit date format and its timezone behavior.
- A computed column created with the native TanStack helper.
- Selection enabled and disabled, with stable `getRowId` using a property other than `id`.
- When to use module-scope definitions versus `useMemo` for changing callbacks or locale.
- The loaded-data limitation and deferred production work.

Acceptance checks:

- [ ] Callers decide their row shape, data source, and displayed fields.
- [ ] Ordinary feature columns require no repeated header or checkbox JSX.
- [ ] A new caller can use the generator without a feature model or changes to shared UI.
- [ ] Documentation examples match the implemented API and pass type checking.

## Suggested Review Chunks

Keep these as small implementation/review units. A chunk can include several commits; avoid committing deliberately broken temporary scaffolding.

1. Types, metadata, defaults, generator, and compile-time contract fixtures: Steps 2-4.
2. Table integration and both feature migrations: Steps 5-6.
3. View options, selection interaction regression checks, and browser stories: Steps 7-8.
4. Old-module removal and contributor documentation: Step 9.

Step 1 happens before the first chunk. Tests should accompany each chunk even though Step 8 collects the final verification requirements.

## Milestone Completion Checklist

- [ ] Accounts and eSIMs use their own typed feature configurations.
- [ ] The generic API accepts caller-owned row types without required domain fields or model imports.
- [ ] Local, inferred, and projected rows are covered by type and behavior checks.
- [ ] Invalid fields and invalid cell formatters are rejected by the dedicated compiler check.
- [ ] Shared defaults render ordinary values and handle nulls consistently.
- [ ] Custom TanStack definitions remain supported.
- [ ] Selection, hiding, and ordering work with the generated definitions.
- [ ] Headers, checkboxes, and view controls have working keyboard interactions.
- [ ] All relevant validation is completed and remaining baseline failures are recorded.
- [ ] A junior developer can add another table using the shared README.
- [ ] Delivery notes call this the column foundation, not a production-ready end-to-end table.
