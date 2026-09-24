import "server-only";

import type {
  CrewCreate,
  CrewListParams,
  CrewRead,
  CrewUpdate,
  DecimalString,
} from "./types";

export type {
  CrewCreate,
  CrewListParams,
  CrewRead,
  CrewUpdate,
  DecimalString,
} from "./types";

type ApiErrorBody = { detail?: unknown };

export class CrewApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, statusText: string, detail?: unknown) {
    super(
      typeof detail === "string" && detail.length > 0
        ? detail
        : `Crew API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`,
    );
    this.name = "CrewApiError";
    this.status = status;
    this.detail = detail;
  }
}

const CREW_PATH = "/api/crew";
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 100;
const ISO_DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/;

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL;
  if (!value?.trim()) {
    throw new Error(
      "The crew API is not configured. Set CORE_API_URL to the Core API origin.",
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
    throw new CrewApiError(response.status, response.statusText, detail);
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

function assertPositiveId(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive integer.`);
  }
}

function normalizeString(value: unknown, field: string, max: number): string {
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

function normalizeNullableString(
  value: unknown,
  field: string,
  max: number,
): string | null {
  return value === null ? null : normalizeString(value, field, max);
}

function normalizeNullableInteger(
  value: unknown,
  field: string,
): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new TypeError(`${field} must be an integer or null.`);
  }
  return value;
}

function normalizeNullableUserId(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number") {
    throw new TypeError("user_id must be a positive integer or null.");
  }
  assertPositiveId(value, "user_id");
  return value;
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
  if (integerDigits + fractionalDigits > 10 || fractionalDigits > 2) {
    throw new RangeError(
      `${field} must have at most 10 digits and 2 decimal places.`,
    );
  }
  return normalized;
}

function normalizePayload(input: CrewCreate, required: true): CrewCreate;
function normalizePayload(input: CrewUpdate, required: false): CrewUpdate;
function normalizePayload(
  input: CrewCreate | CrewUpdate,
  required: boolean,
): CrewCreate | CrewUpdate {
  assertRecord(input, "Crew payload");
  const payload: CrewUpdate = {};

  if (required || input.unique_id !== undefined) {
    payload.unique_id = normalizeString(input.unique_id, "unique_id", 50);
  }
  if (required || input.iscrewid !== undefined) {
    if (typeof input.iscrewid !== "boolean") {
      throw new TypeError("iscrewid must be a boolean.");
    }
    payload.iscrewid = input.iscrewid;
  }
  if (required || input.createdate !== undefined) {
    payload.createdate = normalizeDatetime(input.createdate, "createdate");
  }

  for (const field of ["file1", "file2"] as const) {
    if (input[field] !== undefined) {
      payload[field] = normalizeNullableString(input[field], field, 100);
    }
  }
  for (const field of ["firstname", "lastname", "airline"] as const) {
    if (input[field] !== undefined) {
      payload[field] = normalizeNullableString(input[field], field, 150);
    }
  }
  for (const field of ["file1_hash", "file2_hash"] as const) {
    if (input[field] !== undefined) {
      payload[field] = normalizeNullableString(input[field], field, 64);
    }
  }
  for (const field of ["reason", "type"] as const) {
    if (input[field] !== undefined) {
      payload[field] = normalizeNullableString(input[field], field, 255);
    }
  }
  for (const field of ["dhash", "phash"] as const) {
    if (input[field] !== undefined) {
      payload[field] = normalizeNullableString(input[field], field, 32);
    }
  }
  for (const field of ["dhash_distance", "phash_distance"] as const) {
    if (input[field] !== undefined) {
      payload[field] = normalizeNullableInteger(input[field], field);
    }
  }
  if (input.user_id !== undefined) {
    payload.user_id = normalizeNullableUserId(input.user_id);
  }
  if (input.confidence !== undefined) {
    payload.confidence = normalizeNullableDecimal(
      input.confidence,
      "confidence",
    );
  }
  return payload as CrewCreate | CrewUpdate;
}

function parseCrew(value: unknown): CrewRead {
  assertRecord(value, "Crew response");
  if (
    typeof value.id !== "number" ||
    !Number.isInteger(value.id) ||
    value.id <= 0 ||
    value.user_id === undefined
  ) {
    throw new TypeError("The Core API returned an invalid crew record.");
  }

  try {
    const payload = normalizePayload(value as unknown as CrewCreate, true);
    return {
      id: value.id,
      ...payload,
      user_id: normalizeNullableUserId(value.user_id),
    };
  } catch {
    throw new TypeError("The Core API returned an invalid crew record.");
  }
}

function parseCrewList(value: unknown): CrewRead[] {
  if (!Array.isArray(value)) {
    throw new TypeError("The Core API returned an invalid crew list.");
  }
  return value.map(parseCrew);
}

function normalizeListParams(params: CrewListParams): {
  offset: number;
  limit: number;
} {
  const offset = params.offset ?? DEFAULT_OFFSET;
  const limit = params.limit ?? DEFAULT_LIMIT;
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError("Crew list offset must be a non-negative integer.");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError("Crew list limit must be an integer from 1 to 100.");
  }
  return { offset, limit };
}

export async function fetchCrew(
  params: CrewListParams = {},
): Promise<CrewRead[]> {
  const { offset, limit } = normalizeListParams(params);
  const query = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  return parseCrewList(await request(`${CREW_PATH}?${query}`));
}

export async function fetchCrewMember(crewId: number): Promise<CrewRead> {
  assertPositiveId(crewId, "Crew ID");
  return parseCrew(await request(`${CREW_PATH}/${crewId}`));
}

export async function createCrew(input: CrewCreate): Promise<CrewRead> {
  return parseCrew(
    await request(CREW_PATH, {
      method: "POST",
      body: JSON.stringify(normalizePayload(input, true)),
    }),
  );
}

export async function updateCrew(
  crewId: number,
  input: CrewUpdate,
): Promise<CrewRead> {
  assertPositiveId(crewId, "Crew ID");
  return parseCrew(
    await request(`${CREW_PATH}/${crewId}`, {
      method: "PATCH",
      body: JSON.stringify(normalizePayload(input, false)),
    }),
  );
}

export async function deleteCrew(crewId: number): Promise<void> {
  assertPositiveId(crewId, "Crew ID");
  await request(`${CREW_PATH}/${crewId}`, { method: "DELETE" });
}
