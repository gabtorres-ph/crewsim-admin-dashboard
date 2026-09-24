import "server-only";

import type {
  DecimalString,
  UsageCreate,
  UsageListParams,
  UsageRead,
  UsageUpdate,
} from "./types";

export type {
  DecimalString,
  UsageCreate,
  UsageListParams,
  UsageRead,
  UsageUpdate,
} from "./types";

type ApiErrorBody = { detail?: unknown };

export class UsageApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, statusText: string, detail?: unknown) {
    super(
      typeof detail === "string" && detail.length > 0
        ? detail
        : `Usage API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`,
    );
    this.name = "UsageApiError";
    this.status = status;
    this.detail = detail;
  }
}

const USAGE_PATH = "/api/usage";
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 100;
const ISO_DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/;

const REQUIRED_STRING_FIELDS = [
  "session_id",
  "usage_type",
  "subs_reseller_name",
  "custo_account_name",
  "subs_account_name",
  "imsi",
  "iccid",
  "subs_phone_number",
  "prepaid_package_ids",
  "prepaid_package_qtys",
  "apn",
  "imei",
  "filename",
] as const;

const REQUIRED_INTEGER_FIELDS = [
  "mcc",
  "mnc",
  "total_qty",
  "usage_type_id",
  "subscriber_id",
  "rat",
  "down_bitrate",
  "up_bitrate",
] as const;

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL;
  if (!value?.trim()) {
    throw new Error(
      "The usage API is not configured. Set CORE_API_URL to the Core API origin.",
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
    throw new UsageApiError(response.status, response.statusText, detail);
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

function assertPositiveId(value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError("Usage ID must be a positive integer.");
  }
}

function normalizeString(value: unknown, field: string, max = 100): string {
  if (typeof value !== "string") {
    throw new TypeError(`${field} must be a string.`);
  }
  const normalized = value.trim();
  if (normalized.length < 1 || normalized.length > max) {
    throw new RangeError(
      `${field} must contain between 1 and ${max} characters after trimming.`,
    );
  }
  return normalized;
}

function normalizeNullableString(value: unknown, field: string): string | null {
  return value === null ? null : normalizeString(value, field);
}

function normalizeInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new TypeError(`${field} must be an integer.`);
  }
  return value;
}

function normalizeNullableInteger(
  value: unknown,
  field: string,
): number | null {
  return value === null ? null : normalizeInteger(value, field);
}

function normalizeDatetime(value: unknown, field: string): string {
  if (
    typeof value !== "string" ||
    !ISO_DATETIME_PATTERN.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    throw new TypeError(`${field} must be an ISO-8601 datetime string.`);
  }
  return value;
}

function normalizeNullableDecimal(
  value: unknown,
  field: string,
  maxDigits: number,
  decimalPlaces: number,
): DecimalString | null {
  if (value === null) return null;
  if (typeof value !== "string") {
    throw new TypeError(`${field} must be a decimal string or null.`);
  }

  const normalized = value.trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    throw new TypeError(`${field} must be a decimal string or null.`);
  }

  const unsigned = normalized.replace(/^[+-]/, "");
  const [integerPart, fractionalPart = ""] = unsigned.split(".");
  const integerDigits = integerPart.replace(/^0+/, "").length;
  const fractionalDigits = fractionalPart.replace(/0+$/, "").length;
  if (
    integerDigits + fractionalDigits > maxDigits ||
    fractionalDigits > decimalPlaces
  ) {
    throw new RangeError(
      `${field} must have at most ${maxDigits} digits and ${decimalPlaces} decimal places.`,
    );
  }
  return normalized;
}

function normalizePayload(input: UsageCreate, required: true): UsageCreate;
function normalizePayload(input: UsageUpdate, required: false): UsageUpdate;
function normalizePayload(
  input: UsageCreate | UsageUpdate,
  required: boolean,
): UsageCreate | UsageUpdate {
  assertRecord(input, "Usage payload");
  const payload: UsageUpdate = {};

  if (required || input.usage_date_utc !== undefined) {
    payload.usage_date_utc = normalizeDatetime(
      input.usage_date_utc,
      "usage_date_utc",
    );
  }
  for (const field of REQUIRED_STRING_FIELDS) {
    if (required || input[field] !== undefined) {
      payload[field] = normalizeString(input[field], field);
    }
  }
  if (required || input.toll_free !== undefined) {
    payload.toll_free = normalizeString(input.toll_free, "toll_free", 10);
  }
  for (const field of REQUIRED_INTEGER_FIELDS) {
    if (required || input[field] !== undefined) {
      payload[field] = normalizeInteger(input[field], field);
    }
  }
  if (required || input.dest_phone_number !== undefined) {
    payload.dest_phone_number = normalizeNullableString(
      input.dest_phone_number,
      "dest_phone_number",
    );
  }
  for (const field of ["custo_account_id", "subs_account_id"] as const) {
    if (required || input[field] !== undefined) {
      payload[field] = normalizeNullableInteger(input[field], field);
    }
  }
  for (const field of ["custo_charge", "subs_charge"] as const) {
    if (required || input[field] !== undefined) {
      payload[field] = normalizeNullableDecimal(input[field], field, 20, 15);
    }
  }
  return payload as UsageCreate | UsageUpdate;
}

function parseUsage(value: unknown): UsageRead {
  assertRecord(value, "Usage response");
  if (
    typeof value.id !== "number" ||
    !Number.isInteger(value.id) ||
    value.id <= 0
  ) {
    throw new TypeError("The Core API returned an invalid usage record.");
  }

  try {
    return {
      id: value.id,
      ...normalizePayload(value as unknown as UsageCreate, true),
    };
  } catch {
    throw new TypeError("The Core API returned an invalid usage record.");
  }
}

function parseUsageList(value: unknown): UsageRead[] {
  if (!Array.isArray(value)) {
    throw new TypeError("The Core API returned an invalid usage list.");
  }
  return value.map(parseUsage);
}

function normalizeListParams(params: UsageListParams): {
  offset: number;
  limit: number;
} {
  const offset = params.offset ?? DEFAULT_OFFSET;
  const limit = params.limit ?? DEFAULT_LIMIT;
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError("Usage list offset must be a non-negative integer.");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError("Usage list limit must be an integer from 1 to 100.");
  }
  return { offset, limit };
}

export async function fetchUsage(
  params: UsageListParams = {},
): Promise<UsageRead[]> {
  const { offset, limit } = normalizeListParams(params);
  const query = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  return parseUsageList(await request(`${USAGE_PATH}?${query}`));
}

export async function fetchUsageRecord(usageId: number): Promise<UsageRead> {
  assertPositiveId(usageId);
  return parseUsage(await request(`${USAGE_PATH}/${usageId}`));
}

export async function createUsage(input: UsageCreate): Promise<UsageRead> {
  return parseUsage(
    await request(USAGE_PATH, {
      method: "POST",
      body: JSON.stringify(normalizePayload(input, true)),
    }),
  );
}

export async function updateUsage(
  usageId: number,
  input: UsageUpdate,
): Promise<UsageRead> {
  assertPositiveId(usageId);
  return parseUsage(
    await request(`${USAGE_PATH}/${usageId}`, {
      method: "PATCH",
      body: JSON.stringify(normalizePayload(input, false)),
    }),
  );
}

export async function deleteUsage(usageId: number): Promise<void> {
  assertPositiveId(usageId);
  await request(`${USAGE_PATH}/${usageId}`, { method: "DELETE" });
}
