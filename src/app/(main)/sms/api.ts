import "server-only";

import type { SmsCreate, SmsListParams, SmsRead, SmsUpdate } from "./types";

export type { SmsCreate, SmsListParams, SmsRead, SmsUpdate } from "./types";

type ApiErrorBody = { detail?: unknown };

export class SmsApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, statusText: string, detail?: unknown) {
    super(
      typeof detail === "string" && detail.length > 0
        ? detail
        : `SMS API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`,
    );
    this.name = "SmsApiError";
    this.status = status;
    this.detail = detail;
  }
}

const SMS_PATH = "/api/sms";
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 100;
const ISO_DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/;

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL;
  if (!value?.trim()) {
    throw new Error(
      "The SMS API is not configured. Set CORE_API_URL to the Core API origin.",
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
    throw new SmsApiError(response.status, response.statusText, detail);
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

function normalizeString(value: unknown, field: string, max: number): string {
  if (typeof value !== "string")
    throw new TypeError(`${field} must be a string.`);
  const normalized = value.trim();
  if (normalized.length < 1 || normalized.length > max) {
    throw new RangeError(
      `${field} must contain between 1 and ${max} characters after trimming.`,
    );
  }
  return normalized;
}

function normalizeNullableString(
  value: unknown,
  field: string,
  max: number,
): string | null {
  return value === null ? null : normalizeString(value, field, max);
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
  if (typeof value !== "string") {
    throw new TypeError(`${field} must be an ISO-8601 datetime string.`);
  }
  const normalized = value.trim();
  if (
    !ISO_DATETIME_PATTERN.test(normalized) ||
    Number.isNaN(Date.parse(normalized))
  ) {
    throw new TypeError(`${field} must be an ISO-8601 datetime string.`);
  }
  return normalized;
}

function normalizeNullableDatetime(
  value: unknown,
  field: string,
): string | null {
  return value === null ? null : normalizeDatetime(value, field);
}

function normalizePayload(input: SmsCreate, required: false): SmsCreate;
function normalizePayload(input: SmsUpdate, required: true): SmsUpdate;
function normalizePayload(
  input: SmsCreate | SmsUpdate,
  required: boolean,
): SmsCreate | SmsUpdate {
  assertRecord(input, "SMS payload");
  const language = normalizeString(input.language, "language", 2);
  const payload: Partial<SmsUpdate> = {
    user_id: normalizeInteger(input.user_id, "user_id"),
    imsi: normalizeString(input.imsi, "imsi", 100),
    sender: normalizeString(input.sender, "sender", 100),
    sms_text: normalizeString(input.sms_text, "sms_text", 3000),
    language,
    created_at: normalizeDatetime(input.created_at, "created_at"),
  };

  if (language.length !== 2) {
    throw new RangeError(
      "language must contain exactly 2 characters after trimming.",
    );
  }
  if (required || input.template !== undefined) {
    payload.template = normalizeNullableString(input.template, "template", 100);
  }
  if (required || input.sent_at !== undefined) {
    payload.sent_at = normalizeNullableDatetime(input.sent_at, "sent_at");
  }
  if (required || input.sent_result_code !== undefined) {
    payload.sent_result_code = normalizeNullableString(
      input.sent_result_code,
      "sent_result_code",
      50,
    );
  }
  if (required || input.sent_result_text !== undefined) {
    payload.sent_result_text = normalizeNullableString(
      input.sent_result_text,
      "sent_result_text",
      150,
    );
  }
  if (required || input.retry_counter !== undefined) {
    payload.retry_counter = normalizeNullableInteger(
      input.retry_counter,
      "retry_counter",
    );
  }
  return payload as SmsCreate | SmsUpdate;
}

function parseSms(value: unknown): SmsRead {
  assertRecord(value, "SMS response");
  if (!Number.isInteger(value.id) || (value.id as number) <= 0) {
    throw new TypeError("The Core API returned an invalid SMS ID.");
  }
  try {
    return {
      id: value.id as number,
      ...normalizePayload(value as SmsUpdate, true),
    };
  } catch {
    throw new TypeError("The Core API returned an invalid SMS record.");
  }
}

function parseSmsList(value: unknown): SmsRead[] {
  if (!Array.isArray(value)) {
    throw new TypeError("The Core API returned an invalid SMS list.");
  }
  return value.map(parseSms);
}

function normalizeListParams(params: SmsListParams): {
  offset: number;
  limit: number;
} {
  const offset = params.offset ?? DEFAULT_OFFSET;
  const limit = params.limit ?? DEFAULT_LIMIT;
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError("SMS list offset must be a non-negative integer.");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError("SMS list limit must be an integer from 1 to 100.");
  }
  return { offset, limit };
}

function assertSmsId(smsId: number): void {
  if (!Number.isInteger(smsId) || smsId <= 0) {
    throw new RangeError("SMS ID must be a positive integer.");
  }
}

export async function fetchSms(params: SmsListParams = {}): Promise<SmsRead[]> {
  const { offset, limit } = normalizeListParams(params);
  const query = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  return parseSmsList(await request(`${SMS_PATH}?${query}`));
}

export async function fetchSmsRecord(smsId: number): Promise<SmsRead> {
  assertSmsId(smsId);
  return parseSms(await request(`${SMS_PATH}/${smsId}`));
}

export async function createSms(input: SmsCreate): Promise<SmsRead> {
  return parseSms(
    await request(SMS_PATH, {
      method: "POST",
      body: JSON.stringify(normalizePayload(input, false)),
    }),
  );
}

export async function updateSms(
  smsId: number,
  input: SmsUpdate,
): Promise<SmsRead> {
  assertSmsId(smsId);
  return parseSms(
    await request(`${SMS_PATH}/${smsId}`, {
      method: "PATCH",
      body: JSON.stringify(normalizePayload(input, true)),
    }),
  );
}

export async function deleteSms(smsId: number): Promise<void> {
  assertSmsId(smsId);
  await request(`${SMS_PATH}/${smsId}`, { method: "DELETE" });
}
