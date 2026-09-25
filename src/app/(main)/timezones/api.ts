import "server-only";

import type {
  TimezoneCreate,
  TimezoneListParams,
  TimezoneRead,
  TimezoneUpdate,
} from "./types";

export type {
  TimezoneCreate,
  TimezoneListParams,
  TimezoneRead,
  TimezoneUpdate,
} from "./types";

type ApiErrorBody = { detail?: unknown };

export class TimezonesApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, statusText: string, detail?: unknown) {
    super(
      typeof detail === "string" && detail.length > 0
        ? detail
        : `Timezones API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`,
    );
    this.name = "TimezonesApiError";
    this.status = status;
    this.detail = detail;
  }
}

const TIMEZONES_PATH = "/api/timezones";
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 100;
const ISO_DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/;

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL;
  if (!value?.trim()) {
    throw new Error(
      "The timezones API is not configured. Set CORE_API_URL to the Core API origin.",
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
    throw new TimezonesApiError(response.status, response.statusText, detail);
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

function normalizeTimezoneName(value: unknown, field = "name"): string {
  if (typeof value !== "string") {
    throw new TypeError(`${field} must be a string.`);
  }

  const normalized = value.trim();
  if (normalized.length < 1 || normalized.length > 255) {
    throw new RangeError(
      `${field} must contain between 1 and 255 characters after trimming.`,
    );
  }
  return normalized;
}

function normalizeTimezoneCreate(input: TimezoneCreate): TimezoneCreate {
  assertRecord(input, "Timezone create payload");
  return { name: normalizeTimezoneName(input.name) };
}

function normalizeTimezoneUpdate(input: TimezoneUpdate): TimezoneUpdate {
  assertRecord(input, "Timezone update payload");
  return input.name === undefined
    ? {}
    : { name: normalizeTimezoneName(input.name) };
}

function normalizeCreatedAt(value: unknown): string {
  if (
    typeof value !== "string" ||
    !ISO_DATETIME_PATTERN.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    throw new TypeError("created_at must be an ISO-8601 datetime string.");
  }
  return value;
}

function parseTimezone(value: unknown): TimezoneRead {
  assertRecord(value, "Timezone response");
  try {
    return {
      name: normalizeTimezoneName(value.name),
      created_at: normalizeCreatedAt(value.created_at),
    };
  } catch {
    throw new TypeError("The Core API returned an invalid timezone record.");
  }
}

function parseTimezoneList(value: unknown): TimezoneRead[] {
  if (!Array.isArray(value)) {
    throw new TypeError("The Core API returned an invalid timezone list.");
  }
  return value.map(parseTimezone);
}

function normalizeListParams(params: TimezoneListParams): {
  offset: number;
  limit: number;
} {
  const offset = params.offset ?? DEFAULT_OFFSET;
  const limit = params.limit ?? DEFAULT_LIMIT;
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError(
      "Timezone list offset must be a non-negative integer.",
    );
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError(
      "Timezone list limit must be an integer from 1 to 100.",
    );
  }
  return { offset, limit };
}

function getTimezonePath(timezoneName: string): string {
  const name = normalizeTimezoneName(timezoneName, "Timezone name");
  return `${TIMEZONES_PATH}/${encodeURIComponent(name)}`;
}

export async function fetchTimezones(
  params: TimezoneListParams = {},
): Promise<TimezoneRead[]> {
  const { offset, limit } = normalizeListParams(params);
  const query = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  return parseTimezoneList(await request(`${TIMEZONES_PATH}?${query}`));
}

export async function fetchTimezone(
  timezoneName: string,
): Promise<TimezoneRead> {
  return parseTimezone(await request(getTimezonePath(timezoneName)));
}

export async function createTimezone(
  input: TimezoneCreate,
): Promise<TimezoneRead> {
  return parseTimezone(
    await request(TIMEZONES_PATH, {
      method: "POST",
      body: JSON.stringify(normalizeTimezoneCreate(input)),
    }),
  );
}

export async function updateTimezone(
  timezoneName: string,
  input: TimezoneUpdate,
): Promise<TimezoneRead> {
  return parseTimezone(
    await request(getTimezonePath(timezoneName), {
      method: "PATCH",
      body: JSON.stringify(normalizeTimezoneUpdate(input)),
    }),
  );
}

export async function deleteTimezone(timezoneName: string): Promise<void> {
  await request(getTimezonePath(timezoneName), { method: "DELETE" });
}
