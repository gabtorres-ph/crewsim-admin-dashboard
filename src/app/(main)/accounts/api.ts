/** Data required by POST /api/accounts. */
export type AccountCreate = {
  name: string;
  balance: number;
};

/** Data accepted by PATCH /api/accounts/{accountId}. */
export type AccountUpdate = {
  name?: string;
  balance?: number;
};

/** Account representation returned by the API. */
export type AccountRead = {
  id: number;
  name: string;
  balance: number;
};

export type AccountListParams = {
  offset?: number;
  limit?: number;
};

type ApiErrorBody = {
  detail?: unknown;
};

/**
 * An HTTP error returned by the Core API.
 *
 * Callers can use `status` for control flow (for example, handling a 404) and
 * `detail` when they need the backend's validation or conflict information.
 */
export class AccountsApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, statusText: string, detail?: unknown) {
    super(getApiErrorMessage(status, statusText, detail));
    this.name = "AccountsApiError";
    this.status = status;
    this.detail = detail;
  }
}

const ACCOUNT_PATH = "/api/accounts";
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 100;

function getApiBaseUrl(): string {
  // CORE_API_INTERNAL_URL is retained as a fallback for existing local setups.
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL;

  if (!value?.trim()) {
    throw new Error(
      "The accounts API is not configured. Set CORE_API_URL to the Core API origin.",
    );
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("CORE_API_URL must be a valid absolute URL.");
  }

  return url.toString().replace(/\/$/, "");
}

function getRequestHeaders(hasBody: boolean): Headers {
  const headers = new Headers({ Accept: "application/json" });

  if (hasBody) {
    headers.set("Content-Type", "application/json");
  }

  const accessClientId = process.env.CF_ACCESS_CLIENT_ID;
  const accessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET;

  if (accessClientId && accessClientSecret) {
    headers.set("CF-Access-Client-Id", accessClientId);
    headers.set("CF-Access-Client-Secret", accessClientSecret);
  }

  return headers;
}

async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  const hasBody = init.body !== undefined;
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: getRequestHeaders(hasBody),
  });

  if (!response.ok) {
    const body = await readJson(response);
    const detail = isRecord(body) ? (body as ApiErrorBody).detail : undefined;
    throw new AccountsApiError(response.status, response.statusText, detail);
  }

  if (response.status === 204) {
    return undefined;
  }

  const body = await readJson(response);

  if (body === undefined) {
    throw new Error(
      `The Core API returned an empty ${response.status} response.`,
    );
  }

  return body;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`The Core API returned invalid JSON (${response.status}).`);
  }
}

function getApiErrorMessage(
  status: number,
  statusText: string,
  detail: unknown,
): string {
  if (typeof detail === "string" && detail.length > 0) {
    return detail;
  }

  return `Accounts API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`;
}

function normalizeAccountCreate(input: AccountCreate): AccountCreate {
  assertRecord(input, "Account create payload");

  return {
    name: normalizeName(input.name),
    balance: normalizeBalance(input.balance),
  };
}

function normalizeAccountUpdate(input: AccountUpdate): AccountUpdate {
  assertRecord(input, "Account update payload");

  const payload: AccountUpdate = {};

  if (input.name !== undefined) {
    payload.name = normalizeName(input.name);
  }

  if (input.balance !== undefined) {
    payload.balance = normalizeBalance(input.balance);
  }

  return payload;
}

function normalizeName(value: unknown): string {
  if (typeof value !== "string") {
    throw new TypeError("Account name must be a string.");
  }

  const name = value.trim();

  if (name.length < 1 || name.length > 255) {
    throw new RangeError(
      "Account name must contain between 1 and 255 characters after trimming.",
    );
  }

  return name;
}

function normalizeBalance(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError("Account balance must be a finite number.");
  }

  return value;
}

function assertAccountId(accountId: number): void {
  if (!Number.isInteger(accountId) || accountId <= 0) {
    throw new RangeError("Account ID must be a positive integer.");
  }
}

function parseAccount(value: unknown): AccountRead {
  if (
    !isRecord(value) ||
    !Number.isInteger(value.id) ||
    typeof value.name !== "string" ||
    typeof value.balance !== "number" ||
    !Number.isFinite(value.balance)
  ) {
    throw new TypeError("The Core API returned an invalid account.");
  }

  return {
    id: value.id as number,
    name: value.name,
    balance: value.balance,
  };
}

function parseAccountList(value: unknown): AccountRead[] {
  if (!Array.isArray(value)) {
    throw new TypeError("The Core API returned an invalid account list.");
  }

  return value.map(parseAccount);
}

function assertRecord(value: unknown, label: string): asserts value is object {
  if (!isRecord(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Fetches a page of accounts. Defaults to the backend's first 100 records. */
export async function fetchAccounts(
  params: AccountListParams = {},
): Promise<AccountRead[]> {
  const offset = params.offset ?? DEFAULT_OFFSET;
  const limit = params.limit ?? DEFAULT_LIMIT;

  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError("Account list offset must be a non-negative integer.");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError(
      "Account list limit must be an integer from 1 to 100.",
    );
  }

  const query = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });
  const body = await request(`${ACCOUNT_PATH}?${query}`);

  return parseAccountList(body);
}

/** Fetches one account by its server-generated ID. */
export async function fetchAccount(accountId: number): Promise<AccountRead> {
  assertAccountId(accountId);
  const body = await request(`${ACCOUNT_PATH}/${accountId}`);

  return parseAccount(body);
}

/** Creates an account after applying the backend's input rules locally. */
export async function createAccount(
  input: AccountCreate,
): Promise<AccountRead> {
  const body = await request(ACCOUNT_PATH, {
    method: "POST",
    body: JSON.stringify(normalizeAccountCreate(input)),
  });

  return parseAccount(body);
}

/** Partially updates the fields supplied by the caller. */
export async function updateAccount(
  accountId: number,
  input: AccountUpdate,
): Promise<AccountRead> {
  assertAccountId(accountId);
  const body = await request(`${ACCOUNT_PATH}/${accountId}`, {
    method: "PATCH",
    body: JSON.stringify(normalizeAccountUpdate(input)),
  });

  return parseAccount(body);
}

/** Deletes an account. A referenced account may produce a 409 AccountsApiError. */
export async function deleteAccount(accountId: number): Promise<void> {
  assertAccountId(accountId);
  await request(`${ACCOUNT_PATH}/${accountId}`, { method: "DELETE" });
}
