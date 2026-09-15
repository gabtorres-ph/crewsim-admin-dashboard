# Backend data contract gap closure

Status: contract/list implementation started. DTOs, clients, MSW handlers,
mock fixtures, page stories, and API-backed list pages have been added for the
seven previously placeholder domains. Rich create/edit/delete form workflows
for those pages remain a follow-up UI milestone.

Assessed September 14, 2026 against the current frontend working tree and the sibling `core-crewsim/app` source (HEAD `02c85a8`). Existing uncommitted table/page work is part of the assessment and must be preserved.

## Outcome and scope

Seven of ten domains lack frontend backend contracts: Favorites, Packages, SMS, Usage, Crew, Email Whitelist, and Stripe Notifications. Their pages render hard-coded empty arrays; their column-local row types are placeholders. None has an API, model, mocks, or page stories directory today.

Users, Accounts, and eSIMs have typed clients and MSW coverage. They need targeted alignment rather than replacement. Client coverage is distinct from UI coverage: for example, Accounts currently exposes list loading even though mutation clients and form components exist.

Implement the endpoint/DTO inventory supplied by the user. The table establishes route and DTO names; actual field definitions come from the corresponding backend `schemas.py`, `routes.py`, managers, and tests. Verify the deployed backend matches this local source before integration sign-off. No public web source is needed for these private contracts.

## Coverage and endpoint inventory

Paths below are relative to the shared API base, normally `/api`. For each standard resource, implement POST and GET on the collection and GET, PATCH, DELETE on the item path. POST/PATCH return the Read DTO, GET collection returns Read[], GET item returns Read, and DELETE returns no body.

| Domain / frontend directory | Collection / item | DTOs: create / update / response | Current gap |
| --- | --- | --- | --- |
| Users / `users` | `/users`, `/users/{user_id}` | `UserCreate` / `UserUpdate` / `UserRead` | All five clients exist; reconcile DTO naming and update nullability. |
| Accounts / `accounts` | `/accounts`, `/accounts/{account_id}` | `AccountCreate` / `AccountUpdate` / `AccountRead` | All five clients exist; formalize wire DTO names and distinguish page workflow gaps. |
| eSIMs / `esims` | `/esims`, `/esims/{esim_id}` | `ESIMCreate` / `ESIMUpdate` / `ESIMRead` | Missing item GET client; create and update both use overly broad `EsimInput`. |
| Favorites / `favorites` | `/favorites`, `/favorites/{favorite_id}` | `FavoriteCreate` / none / `FavoriteRead` | All four clients and data-backed UI missing; no PATCH contract. |
| Packages / `packages` | `/packages`, `/packages/{package_id}` | `PackageCreate` / `PackageUpdate` / `PackageRead` | All five clients and data-backed UI missing. |
| SMS / `sms` | `/sms`, `/sms/{sms_id}` | `SmsCreate` / `SmsUpdate` / `SmsRead` | All five clients and data-backed UI missing. |
| Usage / `usage` | `/usage`, `/usage/{usage_id}` | `UsageCreate` / `UsageUpdate` / `UsageRead` | All five clients and data-backed UI missing. |
| Crew / `crew` | `/crew`, `/crew/{crew_id}` | `CrewCreate` / `CrewUpdate` / `CrewRead` | All five clients and data-backed UI missing. |
| Email Whitelist / `whitelist` | `/email-whitelist`, `/email-whitelist/{email_whitelist_id}` | `EmailWhitelistCreate` / `EmailWhitelistUpdate` / `EmailWhitelistRead` | All five clients and data-backed UI missing. |
| Stripe Notifications / `stripe` | `/stripe/notifications`, `/stripe/notifications/{notification_id}` | `StripeNotificationCreate` / `StripeNotificationUpdate` / `StripeNotificationRead` | All five clients and data-backed UI missing. |

Additional supported reads:

| Route | Frontend status / action |
| --- | --- |
| `GET /esims?user_id=` | Existing `listEsims({ userId })`; preserve and test query mapping. |
| `GET /accounts/{account_id}/esims` | Existing `listAccountEsims`; preserve response mapping. |
| `GET /users/{user_id}/esims` | Existing `listUserEsims`; preserve response mapping. |
| `GET /favorites?user_id=` | Add optional user filter to `listFavorites`. |
| `GET /users/{user_id}/favorites` | Add `listUserFavorites`, owned/exported by Favorites API to avoid a Users/Favorites import cycle. |

## Field contracts and table corrections

Source paths in this section are relative to `../core-crewsim/app/`. Copy all DTO fields, optionality, and constraints from these files; table columns are a deliberate subset and must not define the wire contract. Read DTOs include numeric `id`.

| Feature / schema source | Required create fields | Optional nullable create fields | Proposed initial visible fields |
| --- | --- | --- | --- |
| Favorites / `favorites/schemas.py` | `user_id`, `country` | None | `id`, `user_id`, `country`; remove invented `name`. |
| Packages / `packages/schemas.py` | `sku` | `name`, `price`, `points`, `sparkid`, `reward` | `id`, `sku`, `name`, `price`, `points`; `name` is nullable. |
| SMS / `sms/schemas.py` | `user_id`, `imsi`, `sender`, `sms_text`, `language`, `created_at` | `template`, `sent_at`, `sent_result_code`, `sent_result_text`, `retry_counter` | `id`, `user_id`, `sender`, `sms_text`, `language`, `created_at`, `sent_at`; replace invented `message`. |
| Usage / `usage/schemas.py` | See full list below | `dest_phone_number`, `custo_account_id`, `custo_charge`, `subs_account_id`, `subs_charge` | `id`, `usage_date_utc`, `imsi`, `usage_type`, `total_qty`, `custo_charge`, `subs_charge`; replace placeholder fields with schema fields. |
| Crew / `crew/schemas.py` | `unique_id`, `iscrewid`, `createdate` | `file1`, `file2`, `firstname`, `lastname`, `airline`, `user_id`, `file1_hash`, `file2_hash`, `reason`, `confidence`, `type`, `dhash`, `phash`, `dhash_distance`, `phash_distance` | `id`, `unique_id`, `firstname`, `lastname`, `airline`, `iscrewid`, `user_id`, `createdate`; any full name is a view projection. |
| Email Whitelist / `email/schemas.py` | `email`, `status` | None | `id`, `email`, `status`, `createdate`; timestamp is response-only. |
| Stripe Notifications / `stripe/schemas.py` | `eventid`, `invoiceid`, `customerid`, `amount_net`, `amount_tax`, `amount_gross`, `currency`, `sku`, `userid`, `createdate` | `taxrate`, `taxcountry`, `state`, `imsi`, `amount_credit` | `id`, `eventid`, `invoiceid`, `userid`, `amount_gross`, `currency`, `state`, `createdate`; replace invented `event`. |

Usage's required create fields are `usage_date_utc`, `session_id`, `mcc`, `mnc`, `total_qty`, `usage_type_id`, `usage_type`, `subs_reseller_name`, `custo_account_name`, `subs_account_name`, `subscriber_id`, `imsi`, `iccid`, `subs_phone_number`, `prepaid_package_ids`, `prepaid_package_qtys`, `toll_free`, `apn`, `rat`, `imei`, `down_bitrate`, `up_bitrate`, and `filename`. Keep unusual spellings and string representations exactly as defined; do not infer arrays from `prepaid_package_ids` or booleans from `toll_free`.

## Contract rules

1. Keep wire types in feature-owned `model/types.ts`, exported from `model/index.ts`, using the supplied DTO names. Follow the repository's existing file naming conventions and extend existing `types.ts` files where present. Keep existing UI models where mapping is useful, especially camelCase eSIMs. New tables may consume Read DTOs directly; calculated labels belong in view projections. Do not use casts to make placeholder rows appear compatible.
2. Use separate create and update inputs. For eSIM creation, require `account_id` and `imsi`; for PATCH, both may be omitted. Preserve existing camelCase UI input adapters, but change their signatures to the appropriate create/update types.
3. Omitted PATCH fields mean unchanged. Users and eSIMs reject explicit null on every update field, including fields nullable in Read/Create. Accounts reject null for both fields. Packages reject null only for `sku`; SMS, Usage, Crew, and Stripe reject null for required base fields and permit it for nullable fields. Whitelist rejects null for both writable fields. Encode these semantics explicitly, including backend field validators; blindly translating OpenAPI null unions or using `Partial<Create>` can be inaccurate.
4. Remove only `undefined` during serialization for the newer contracts; preserve permitted `null`, zero, and false. Do not reuse the existing Users/Accounts `toRequest` or eSIM `setIfPresent` helpers indiscriminately because they strip nulls. Existing Users/eSIM UI must not imply that blanking a field clears it. Clearing those fields requires a separate backend contract change.
5. Use public JSON keys. Favorites, Crew, and eSIMs expose `user_id`; Stripe exposes `userid`. Backend validation aliases such as `accountid` are database adaptation details, not a reason to rename outbound eSIM JSON.
6. Dates are JSON strings, not JavaScript Date objects in DTOs. Validate form input and document display timezone. Preserve nullable dates and backend-returned values.
7. Verify actual JSON serialization of Pydantic Decimal fields using backend response fixtures: Usage charges (20 digits, 15 decimal places), Crew confidence (10, 2), and Stripe amounts/taxrate (10, 2). Preserve decimal strings at the boundary and in form editing; do not round-trip through JavaScript Number. Choose request typing based on the backend schema and response typing based on JSON-mode serialization. Account balance and Package price are backend floats and remain numbers. Check large integer values against JavaScript safe-integer limits before claiming lossless support.
8. All inspected list routes use `offset >= 0`, `1 <= limit <= 100`, default limit 100, and return arrays without totals. Only documented user filters are supported; do not send speculative search/sort parameters. Use incremental loading with offset, a visible loaded-record count, and a Load more control. A full batch means another request may exist; an empty/short batch ends loading. Sorting/filtering applies to loaded rows and must be labeled accordingly. Reset loading and selection when a user filter changes.
9. POST returns 201, DELETE 204, and read/update operations return JSON. Preserve FastAPI string or validation-array `detail` errors and HTTP status in a typed shared `ApiError`. Support 404, 409, 422 and network/non-JSON failures without losing the fallback message. Server data remains authoritative after mutations.
10. Mirror actual schema length and numeric restrictions; do not invent enum values for whitelist `status`, notification `state`, or crew `type`. Favorites user IDs must be positive, and both filtered Favorites routes reject a missing user with 404. Consult each manager/test before adding relationship validation to mocks.

## Implementation sequence

### 1. Establish DTO and transport foundations

Files: `src/features/*/model/types.ts`, model barrels, `src/shared/api/request.ts`, and focused contract tests.

- Record backend schema/route provenance and representative JSON responses, especially alias and Decimal fields. Use backend JSON-mode DTO serialization or a disposable local backend, not fabricated fixtures, for this initial evidence.
- Add DTOs for all ten domains with the exact names in the inventory; retain compatible existing public model aliases during migration.
- Add typed HTTP errors and a small shared pagination parameter/query utility. Keep shared code domain-neutral.
- Fix existing client signatures and add/export `getEsim`. Verify existing nested eSIM APIs against the same `ESIMRead` mapping.
- Add contract tests for required create fields, partial updates, permitted versus rejected nulls, aliases, decimal preservation, zero/false, and 204 responses. Ensure tests cover observed wire behavior, not just identical frontend mock assumptions.

Exit: the existing three domains retain working calls; all ten DTO families are defined from backend evidence; no missing eSIM detail endpoint.

### 2. Integrate Favorites, Packages, and Email Whitelist

For each feature add `api/<resource>.ts`, `api/index.ts`, model exports, `mocks/data.ts`, `mocks/handlers.ts`, `mocks/index.ts`, and page stories. Update existing pages and `components/columns.tsx` in place.

- Implement typed list/detail/create/delete calls, plus update for Packages and Whitelist.
- Add both Favorites user-filter routes and user selection with accessible user labels. Keep stored/requested IDs numeric.
- Replace constant empty arrays with loading, populated, empty, error/retry, and incremental loading states.
- Add detail views and create/edit forms for supported operations; Favorites has create/delete only. Do not expose an Edit favorite action.
- Whitelist create/edit sends only `email` and `status`; display server-generated `createdate`. Packages create requires SKU even if a display name is absent.
- Reconcile displayed data after successful writes and retain entered form data on failure. Clear stale selections after deletion.

Exit: all reference operations for these three features work through both real API and MSW; columns match Read DTOs.

### 3. Integrate Crew and SMS

Apply the same feature structure and all five operations to each domain.

- Crew forms must supply `unique_id`, `iscrewid`, and `createdate`; model optional names, file references, and analysis metadata accurately. These CRUD endpoints do not define file upload or identity verification workflows.
- SMS forms must supply the required user/IMSI, sender, text, language, and creation timestamp. Enforce the two-character language constraint and actual length limits. Do not label record creation as sending SMS: the inspected manager persists records and provides no send operation.
- Preserve explicit null for fields these DTOs allow to be cleared. Keep raw identifiers visible if a related display label cannot be resolved.

Exit: Crew and SMS support record management, including detail retrieval, nullable updates, errors, mocks, and stories.

### 4. Integrate Usage and Stripe Notifications

Apply the same feature structure and all five operations. Group large forms and detail views by related fields while keeping DTOs complete.

- Usage: retain telecom identifiers as strings where specified; display quantities without inventing units absent from the contract. Preserve precision for charge fields.
- Stripe: use `/stripe/notifications` exactly, retain `userid`, and preserve decimal amounts. These endpoints manage stored notification records; they do not define payment processing, webhook verification, replay, or refunds.
- Implement record create/edit/delete controls with clear record-management wording and normal delete confirmation. Any operational action beyond CRUD requires its own backend contract.

Exit: both features exercise all reference operations, including high-precision responses and permitted null clearing.

### 5. Complete cross-feature integration and verification

Files: `src/shared/mocks/handlers.ts`, `src/shared/mocks/reset.ts`, feature stories, `README.md`, and test configuration as needed.

- Register/reset all seven new mock datasets through feature barrels. Keep mocks out of production imports and make all fixtures deterministic and mutually consistent where relationships exist.
- Verify both existing nested eSIM reads and both Favorites filter routes. Ensure detail GETs are used/tested rather than silently substituting list rows.
- Audit existing Users/Accounts/eSIM pages separately from their clients. Report any unreachable mutation controls as UI work; do not claim that client coverage proves complete management workflows.
- Update README's three-resource REST table and mock coverage to all ten domains, including pagination limits and domain-specific null semantics.
- Coordinate with `docs/plans/data-table-milestone-1.md`; this work does not depend on finishing the generic column refactor. Keep model ownership and API changes separate from table infrastructure changes.

Exit: every endpoint in the inventory has a typed exported client and verification evidence; all seven former placeholders load real data and support their documented record operations.

## Acceptance and test matrix

| Area | Required evidence |
| --- | --- |
| DTO accuracy | Every schema field accounted for, no invented wire keys, correct create requiredness and update nullability. Backend fixtures confirm response aliases and decimals. |
| Endpoint coverage | Exact methods/paths for all ten domains; both nested eSIM routes; both Favorites user filter variants; no Favorites PATCH. |
| Serialization | Omitted versus null, zero, false, dates, numeric IDs, decimal precision, and UI-to-wire mappings. |
| Read behavior | List/detail success, empty lists, 404, service error/retry, late responses after changing filters, and more than 100 records via offset. |
| Mutation behavior | Create/edit/delete success, 204 handling, 409 conflict, 422 field errors, preserved input on failure, and authoritative refresh. |
| UI states | Populated/loading/empty/error stories for seven new pages; form validation and mutation-error interactions; no fake action controls. |
| Mock fidelity | Production-like route/status/payload semantics, correct relationship behavior, all reset functions registered, and tests grounded in backend examples. |
| Regression | Existing Users, Accounts, eSIMs and nested reads remain functional; no unrelated working-tree changes overwritten. |

Use the installed Storybook/MSW tooling for UI behavior. The repository currently has only a Storybook Vitest project; if pure client/serializer tests are added, add a separate Node Vitest project and script rather than assuming a unit-test command already exists. Run that project's tests plus `npm run lint`, `npm run build`, `npm run test-storybook`, and `npm run build-storybook` after implementation. Record baseline failures separately from regressions.

Finally, smoke-test list/detail and reversible create/update/delete flows against a disposable seeded backend, including relationship errors and nullable updates. Do not describe mock-only success as verified live integration.

## Remaining decisions and boundaries

- Confirm local schemas match the deployed backend before release; the provided table alone cannot prove field-level compatibility.
- Confirm supported business values for open string status/type fields before replacing text inputs with fixed selects.
- If full-dataset search, sorting, totals, user/eSIM null clearing, SMS sending, file uploads, or Stripe operational actions are required, define additional backend contracts. These are not supplied by the reference.
- Contract completion means all documented clients and DTOs are verified. Feature completion additionally requires the page/form/state checks above; track both explicitly.
