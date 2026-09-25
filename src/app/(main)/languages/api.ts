import "server-only";

import type {
  LanguageCreate,
  LanguageListParams,
  LanguageRead,
  LanguageUpdate,
} from "./types";

export type {
  LanguageCreate,
  LanguageListParams,
  LanguageRead,
  LanguageUpdate,
} from "./types";

type ApiErrorBody = { detail?: unknown };

export class LanguagesApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, statusText: string, detail?: unknown) {
    super(
      typeof detail === "string" && detail.length > 0
        ? detail
        : `Languages API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`,
    );
    this.name = "LanguagesApiError";
    this.status = status;
    this.detail = detail;
  }
}

const LANGUAGES_PATH = "/api/languages";
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 100;

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL;
  if (!value?.trim()) {
    throw new Error(
      "The languages API is not configured. Set CORE_API_URL to the Core API origin.",
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
    throw new LanguagesApiError(response.status, response.statusText, detail);
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
  length: number,
): string {
  if (typeof value !== "string")
    throw new TypeError(`${field} must be a string.`);
  const normalized = value.trim();
  if (normalized.length !== length) {
    throw new RangeError(
      `${field} must contain exactly ${length} characters after trimming.`,
    );
  }
  return normalized;
}

function normalizeName(value: unknown): string {
  if (typeof value !== "string") throw new TypeError("name must be a string.");
  const normalized = value.trim();
  if (normalized.length < 1 || normalized.length > 150) {
    throw new RangeError(
      "name must contain between 1 and 150 characters after trimming.",
    );
  }
  return normalized;
}

function normalizeNullableString(
  value: unknown,
  field: string,
  length: number,
): string | null {
  return value === null ? null : normalizeString(value, field, length);
}

function normalizePayload(
  input: LanguageCreate,
  required: false,
): LanguageCreate;
function normalizePayload(
  input: LanguageUpdate,
  required: true,
): LanguageUpdate;
function normalizePayload(
  input: LanguageCreate | LanguageUpdate,
  required: boolean,
): LanguageCreate | LanguageUpdate {
  assertRecord(input, "Language payload");
  const payload: Partial<LanguageUpdate> = {
    iso3: normalizeString(input.iso3, "iso3", 3),
    name: normalizeName(input.name),
  };
  if (required || input.iso1 !== undefined) {
    payload.iso1 = normalizeNullableString(input.iso1, "iso1", 2);
  }
  if (required || input.iso2b !== undefined) {
    payload.iso2b = normalizeNullableString(input.iso2b, "iso2b", 3);
  }
  if (required || input.iso2t !== undefined) {
    payload.iso2t = normalizeNullableString(input.iso2t, "iso2t", 3);
  }
  return payload as LanguageCreate | LanguageUpdate;
}

function parseLanguage(value: unknown): LanguageRead {
  assertRecord(value, "Language response");
  if (!Number.isInteger(value.id) || (value.id as number) <= 0) {
    throw new TypeError("The Core API returned an invalid language ID.");
  }
  try {
    return {
      id: value.id as number,
      ...normalizePayload(value as LanguageUpdate, true),
    };
  } catch {
    throw new TypeError("The Core API returned an invalid language record.");
  }
}

function parseLanguageList(value: unknown): LanguageRead[] {
  if (!Array.isArray(value)) {
    throw new TypeError("The Core API returned an invalid language list.");
  }
  return value.map(parseLanguage);
}

function normalizeListParams(params: LanguageListParams): {
  offset: number;
  limit: number;
} {
  const offset = params.offset ?? DEFAULT_OFFSET;
  const limit = params.limit ?? DEFAULT_LIMIT;
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError(
      "Language list offset must be a non-negative integer.",
    );
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError(
      "Language list limit must be an integer from 1 to 100.",
    );
  }
  return { offset, limit };
}

function assertLanguageId(languageId: number): void {
  if (!Number.isInteger(languageId) || languageId <= 0) {
    throw new RangeError("Language ID must be a positive integer.");
  }
}

export async function fetchLanguages(
  params: LanguageListParams = {},
): Promise<LanguageRead[]> {
  const { offset, limit } = normalizeListParams(params);
  const query = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  return parseLanguageList(await request(`${LANGUAGES_PATH}?${query}`));
}

export async function fetchLanguage(languageId: number): Promise<LanguageRead> {
  assertLanguageId(languageId);
  return parseLanguage(await request(`${LANGUAGES_PATH}/${languageId}`));
}

export async function createLanguage(
  input: LanguageCreate,
): Promise<LanguageRead> {
  return parseLanguage(
    await request(LANGUAGES_PATH, {
      method: "POST",
      body: JSON.stringify(normalizePayload(input, false)),
    }),
  );
}

export async function updateLanguage(
  languageId: number,
  input: LanguageUpdate,
): Promise<LanguageRead> {
  assertLanguageId(languageId);
  return parseLanguage(
    await request(`${LANGUAGES_PATH}/${languageId}`, {
      method: "PATCH",
      body: JSON.stringify(normalizePayload(input, true)),
    }),
  );
}

export async function deleteLanguage(languageId: number): Promise<void> {
  assertLanguageId(languageId);
  await request(`${LANGUAGES_PATH}/${languageId}`, { method: "DELETE" });
}
