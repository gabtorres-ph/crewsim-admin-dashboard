import "server-only";

import type {
  CurrencyCreate,
  CurrencyListParams,
  CurrencyRead,
  CurrencyUpdate,
} from "./types";

export type {
  CurrencyCreate,
  CurrencyListParams,
  CurrencyRead,
  CurrencyUpdate,
} from "./types";

type ApiErrorBody = { detail?: unknown };

export class CurrenciesApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, statusText: string, detail?: unknown) {
    super(
      typeof detail === "string" && detail.length > 0
        ? detail
        : `Currencies API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`,
    );
    this.name = "CurrenciesApiError";
    this.status = status;
    this.detail = detail;
  }
}

const CURRENCIES_PATH = "/api/currencies";
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 100;

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL;
  if (!value?.trim()) {
    throw new Error(
      "The currencies API is not configured. Set CORE_API_URL to the Core API origin.",
    );
  }

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error("CORE_API_URL must be a valid absolute URL.");
  }
}

function getRequestHeaders(hasBody: boolean): Headers {
  const headers = new Headers({ Accept: "application/json" });
  if (hasBody) headers.set("Content-Type", "application/json");

  const accessClientId = process.env.CF_ACCESS_CLIENT_ID;
  const accessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET;
  if (accessClientId && accessClientSecret) {
    headers.set("CF-Access-Client-Id", accessClientId);
    headers.set("CF-Access-Client-Secret", accessClientSecret);
  }
  return headers;
}

async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: getRequestHeaders(init.body !== undefined),
  });

  if (!response.ok) {
    const body = await readJson(response);
    const detail = isRecord(body) ? (body as ApiErrorBody).detail : undefined;
    throw new CurrenciesApiError(response.status, response.statusText, detail);
  }
  if (response.status === 204) return undefined;

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
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`The Core API returned invalid JSON (${response.status}).`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertRecord(
  value: unknown,
  label: string,
): asserts value is Record<string, unknown> {
  if (!isRecord(value)) throw new TypeError(`${label} must be an object.`);
}

function normalizeString(
  value: unknown,
  field: string,
  minimumLength: number,
  maximumLength: number,
): string {
  if (typeof value !== "string") {
    throw new TypeError(`${field} must be a string.`);
  }

  const normalized = value.trim();
  if (normalized.length < minimumLength || normalized.length > maximumLength) {
    const requirement =
      minimumLength === maximumLength
        ? `exactly ${minimumLength}`
        : `between ${minimumLength} and ${maximumLength}`;
    throw new RangeError(
      `${field} must contain ${requirement} characters after trimming.`,
    );
  }
  return normalized;
}

function normalizeInteger(
  value: unknown,
  field: string,
  minimum: number,
  maximum?: number,
): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new TypeError(`${field} must be an integer.`);
  }
  if (value < minimum || (maximum !== undefined && value > maximum)) {
    const requirement =
      maximum === undefined
        ? `greater than or equal to ${minimum}`
        : `between ${minimum} and ${maximum}`;
    throw new RangeError(`${field} must be ${requirement}.`);
  }
  return value;
}

function normalizeCurrencyCreate(input: CurrencyCreate): CurrencyCreate {
  assertRecord(input, "Currency create payload");
  return {
    code: normalizeString(input.code, "code", 3, 3),
    name: normalizeString(input.name, "name", 1, 100),
    symbol: normalizeString(input.symbol, "symbol", 1, 10),
    symbol_native: normalizeString(input.symbol_native, "symbol_native", 1, 10),
    decimal_digits: normalizeInteger(input.decimal_digits, "decimal_digits", 0),
    rounding: normalizeInteger(input.rounding, "rounding", 0),
    iso_numeric: normalizeInteger(input.iso_numeric, "iso_numeric", 1, 999),
  };
}

function normalizeCurrencyUpdate(input: CurrencyUpdate): CurrencyUpdate {
  assertRecord(input, "Currency update payload");
  const payload: CurrencyUpdate = {};

  if (input.code !== undefined) {
    payload.code = normalizeString(input.code, "code", 3, 3);
  }
  if (input.name !== undefined) {
    payload.name = normalizeString(input.name, "name", 1, 100);
  }
  if (input.symbol !== undefined) {
    payload.symbol = normalizeString(input.symbol, "symbol", 1, 10);
  }
  if (input.symbol_native !== undefined) {
    payload.symbol_native = normalizeString(
      input.symbol_native,
      "symbol_native",
      1,
      10,
    );
  }
  if (input.decimal_digits !== undefined) {
    payload.decimal_digits = normalizeInteger(
      input.decimal_digits,
      "decimal_digits",
      0,
    );
  }
  if (input.rounding !== undefined) {
    payload.rounding = normalizeInteger(input.rounding, "rounding", 0);
  }
  if (input.iso_numeric !== undefined) {
    payload.iso_numeric = normalizeInteger(
      input.iso_numeric,
      "iso_numeric",
      1,
      999,
    );
  }
  return payload;
}

function parseCurrency(value: unknown): CurrencyRead {
  assertRecord(value, "Currency response");
  if (typeof value.id !== "number" || !Number.isInteger(value.id)) {
    throw new TypeError("The Core API returned an invalid currency record.");
  }

  try {
    return {
      id: value.id,
      ...normalizeCurrencyCreate(value as unknown as CurrencyCreate),
    };
  } catch {
    throw new TypeError("The Core API returned an invalid currency record.");
  }
}

function parseCurrencyList(value: unknown): CurrencyRead[] {
  if (!Array.isArray(value)) {
    throw new TypeError("The Core API returned an invalid currency list.");
  }
  return value.map(parseCurrency);
}

function normalizeListParams(params: CurrencyListParams): {
  offset: number;
  limit: number;
} {
  const offset = params.offset ?? DEFAULT_OFFSET;
  const limit = params.limit ?? DEFAULT_LIMIT;
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError(
      "Currency list offset must be a non-negative integer.",
    );
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError(
      "Currency list limit must be an integer from 1 to 100.",
    );
  }
  return { offset, limit };
}

function assertCurrencyId(currencyId: number): void {
  if (!Number.isInteger(currencyId) || currencyId <= 0) {
    throw new RangeError("Currency ID must be a positive integer.");
  }
}

export async function fetchCurrencies(
  params: CurrencyListParams = {},
): Promise<CurrencyRead[]> {
  const { offset, limit } = normalizeListParams(params);
  const query = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  return parseCurrencyList(await request(`${CURRENCIES_PATH}?${query}`));
}

export async function fetchCurrency(currencyId: number): Promise<CurrencyRead> {
  assertCurrencyId(currencyId);
  return parseCurrency(await request(`${CURRENCIES_PATH}/${currencyId}`));
}

export async function createCurrency(
  input: CurrencyCreate,
): Promise<CurrencyRead> {
  return parseCurrency(
    await request(CURRENCIES_PATH, {
      method: "POST",
      body: JSON.stringify(normalizeCurrencyCreate(input)),
    }),
  );
}

export async function updateCurrency(
  currencyId: number,
  input: CurrencyUpdate,
): Promise<CurrencyRead> {
  assertCurrencyId(currencyId);
  return parseCurrency(
    await request(`${CURRENCIES_PATH}/${currencyId}`, {
      method: "PATCH",
      body: JSON.stringify(normalizeCurrencyUpdate(input)),
    }),
  );
}

export async function deleteCurrency(currencyId: number): Promise<void> {
  assertCurrencyId(currencyId);
  await request(`${CURRENCIES_PATH}/${currencyId}`, { method: "DELETE" });
}
