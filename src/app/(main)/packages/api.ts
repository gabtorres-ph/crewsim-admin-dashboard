import "server-only";

import type {
  PackageCreate,
  PackageListParams,
  PackageRead,
  PackageUpdate,
} from "./types";

export type {
  PackageCreate,
  PackageListParams,
  PackageRead,
  PackageUpdate,
} from "./types";

type ApiErrorBody = { detail?: unknown };

export class PackagesApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, statusText: string, detail?: unknown) {
    super(
      typeof detail === "string" && detail.length > 0
        ? detail
        : `Packages API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`,
    );
    this.name = "PackagesApiError";
    this.status = status;
    this.detail = detail;
  }
}

const PACKAGE_PATH = "/api/packages";
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 100;

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL;
  if (!value?.trim()) {
    throw new Error(
      "The packages API is not configured. Set CORE_API_URL to the Core API origin.",
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
    throw new PackagesApiError(response.status, response.statusText, detail);
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
    throw new RangeError("Package ID must be a positive integer.");
  }
}

function normalizeString(value: unknown, field: string): string {
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

function normalizeNullableString(value: unknown, field: string): string | null {
  return value === null ? null : normalizeString(value, field);
}

function normalizeNullableNumber(value: unknown, field: string): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${field} must be a finite number or null.`);
  }
  return value;
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

function normalizeCreate(input: PackageCreate): PackageCreate {
  assertRecord(input, "Package create payload");
  const payload: PackageCreate = { sku: normalizeString(input.sku, "SKU") };

  if (input.name !== undefined) {
    payload.name = normalizeNullableString(input.name, "Name");
  }
  if (input.price !== undefined) {
    payload.price = normalizeNullableNumber(input.price, "Price");
  }
  for (const field of ["points", "sparkid", "reward"] as const) {
    if (input[field] !== undefined) {
      payload[field] = normalizeNullableInteger(input[field], field);
    }
  }
  return payload;
}

function normalizeUpdate(input: PackageUpdate): PackageUpdate {
  assertRecord(input, "Package update payload");
  const payload: PackageUpdate = {};

  if (input.sku !== undefined) payload.sku = normalizeString(input.sku, "SKU");
  if (input.name !== undefined) {
    payload.name = normalizeNullableString(input.name, "Name");
  }
  if (input.price !== undefined) {
    payload.price = normalizeNullableNumber(input.price, "Price");
  }
  for (const field of ["points", "sparkid", "reward"] as const) {
    if (input[field] !== undefined) {
      payload[field] = normalizeNullableInteger(input[field], field);
    }
  }
  return payload;
}

function parsePackage(value: unknown): PackageRead {
  assertRecord(value, "Package response");
  if (
    typeof value.id !== "number" ||
    !Number.isInteger(value.id) ||
    value.id <= 0 ||
    typeof value.sku !== "string" ||
    (value.name !== null && typeof value.name !== "string") ||
    (value.price !== null &&
      (typeof value.price !== "number" || !Number.isFinite(value.price))) ||
    [value.points, value.sparkid, value.reward].some(
      (item) => item !== null && !Number.isInteger(item),
    )
  ) {
    throw new TypeError("The Core API returned an invalid package.");
  }
  return value as PackageRead;
}

function parsePackageList(value: unknown): PackageRead[] {
  if (!Array.isArray(value)) {
    throw new TypeError("The Core API returned an invalid package list.");
  }
  return value.map(parsePackage);
}

function normalizeListParams(params: PackageListParams): {
  offset: number;
  limit: number;
} {
  const offset = params.offset ?? DEFAULT_OFFSET;
  const limit = params.limit ?? DEFAULT_LIMIT;
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError("Package list offset must be a non-negative integer.");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError(
      "Package list limit must be an integer from 1 to 100.",
    );
  }
  return { offset, limit };
}

export async function fetchPackages(
  params: PackageListParams = {},
): Promise<PackageRead[]> {
  const { offset, limit } = normalizeListParams(params);
  const query = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  return parsePackageList(await request(`${PACKAGE_PATH}?${query}`));
}

export async function fetchPackage(packageId: number): Promise<PackageRead> {
  assertPositiveId(packageId);
  return parsePackage(await request(`${PACKAGE_PATH}/${packageId}`));
}

export async function createPackage(
  input: PackageCreate,
): Promise<PackageRead> {
  return parsePackage(
    await request(PACKAGE_PATH, {
      method: "POST",
      body: JSON.stringify(normalizeCreate(input)),
    }),
  );
}

export async function updatePackage(
  packageId: number,
  input: PackageUpdate,
): Promise<PackageRead> {
  assertPositiveId(packageId);
  return parsePackage(
    await request(`${PACKAGE_PATH}/${packageId}`, {
      method: "PATCH",
      body: JSON.stringify(normalizeUpdate(input)),
    }),
  );
}

export async function deletePackage(packageId: number): Promise<void> {
  assertPositiveId(packageId);
  await request(`${PACKAGE_PATH}/${packageId}`, { method: "DELETE" });
}
