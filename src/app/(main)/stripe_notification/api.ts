import "server-only";

import type {
  DecimalString,
  StripeNotificationCreate,
  StripeNotificationListParams,
  StripeNotificationRead,
  StripeNotificationUpdate,
} from "./types";

export type {
  DecimalString,
  StripeNotificationCreate,
  StripeNotificationListParams,
  StripeNotificationRead,
  StripeNotificationUpdate,
} from "./types";

type ApiErrorBody = { detail?: unknown };

export class StripeNotificationsApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, statusText: string, detail?: unknown) {
    super(
      typeof detail === "string" && detail.length > 0
        ? detail
        : `Stripe notifications API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`,
    );
    this.name = "StripeNotificationsApiError";
    this.status = status;
    this.detail = detail;
  }
}

const STRIPE_NOTIFICATION_PATH = "/api/stripe/notifications";
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 100;
const ISO_DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/;

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL;
  if (!value?.trim()) {
    throw new Error(
      "The Stripe notifications API is not configured. Set CORE_API_URL to the Core API origin.",
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
    throw new StripeNotificationsApiError(
      response.status,
      response.statusText,
      detail,
    );
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

function normalizeString(value: unknown, field: string): string {
  if (typeof value !== "string")
    throw new TypeError(`${field} must be a string.`);
  const normalized = value.trim();
  if (normalized.length < 1 || normalized.length > 100) {
    throw new RangeError(
      `${field} must contain between 1 and 100 characters after trimming.`,
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

function normalizeDecimal(value: unknown, field: string): DecimalString {
  if (typeof value !== "string") {
    throw new TypeError(`${field} must be a decimal string.`);
  }
  const normalized = value.trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    throw new TypeError(`${field} must be a decimal string.`);
  }

  const unsigned = normalized.replace(/^[+-]/, "");
  const [integerPart, fractionalPart = ""] = unsigned.split(".");
  const integerDigits = integerPart.replace(/^0+/, "").length;
  if (integerDigits + fractionalPart.length > 10 || fractionalPart.length > 2) {
    throw new RangeError(
      `${field} must have at most 10 digits and 2 decimal places.`,
    );
  }
  return normalized;
}

function normalizeNullableDecimal(
  value: unknown,
  field: string,
): DecimalString | null {
  return value === null ? null : normalizeDecimal(value, field);
}

function normalizePayload(
  input: StripeNotificationCreate,
  required: false,
): StripeNotificationCreate;
function normalizePayload(
  input: StripeNotificationUpdate,
  required: true,
): StripeNotificationUpdate;
function normalizePayload(
  input: StripeNotificationCreate | StripeNotificationUpdate,
  required: boolean,
): StripeNotificationCreate | StripeNotificationUpdate {
  assertRecord(input, "Stripe notification payload");
  const payload: Partial<StripeNotificationUpdate> = {
    eventid: normalizeString(input.eventid, "eventid"),
    invoiceid: normalizeString(input.invoiceid, "invoiceid"),
    customerid: normalizeString(input.customerid, "customerid"),
    amount_net: normalizeDecimal(input.amount_net, "amount_net"),
    amount_tax: normalizeDecimal(input.amount_tax, "amount_tax"),
    amount_gross: normalizeDecimal(input.amount_gross, "amount_gross"),
    currency: normalizeString(input.currency, "currency"),
    sku: normalizeString(input.sku, "sku"),
    userid: normalizeInteger(input.userid, "userid"),
    createdate: normalizeDatetime(input.createdate, "createdate"),
  };
  if (required || input.taxrate !== undefined) {
    payload.taxrate = normalizeNullableDecimal(input.taxrate, "taxrate");
  }
  for (const field of ["taxcountry", "state", "imsi"] as const) {
    if (required || input[field] !== undefined) {
      payload[field] = normalizeNullableString(input[field], field);
    }
  }
  if (required || input.amount_credit !== undefined) {
    payload.amount_credit = normalizeNullableDecimal(
      input.amount_credit,
      "amount_credit",
    );
  }
  return payload as StripeNotificationCreate | StripeNotificationUpdate;
}

function parseStripeNotification(value: unknown): StripeNotificationRead {
  assertRecord(value, "Stripe notification response");
  if (!Number.isInteger(value.id) || (value.id as number) <= 0) {
    throw new TypeError(
      "The Core API returned an invalid Stripe notification ID.",
    );
  }
  try {
    return {
      id: value.id as number,
      ...normalizePayload(value as StripeNotificationUpdate, true),
    };
  } catch {
    throw new TypeError(
      "The Core API returned an invalid Stripe notification record.",
    );
  }
}

function parseStripeNotificationList(value: unknown): StripeNotificationRead[] {
  if (!Array.isArray(value)) {
    throw new TypeError(
      "The Core API returned an invalid Stripe notification list.",
    );
  }
  return value.map(parseStripeNotification);
}

function normalizeListParams(params: StripeNotificationListParams): {
  offset: number;
  limit: number;
} {
  const offset = params.offset ?? DEFAULT_OFFSET;
  const limit = params.limit ?? DEFAULT_LIMIT;
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError(
      "Stripe notification list offset must be a non-negative integer.",
    );
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError(
      "Stripe notification list limit must be an integer from 1 to 100.",
    );
  }
  return { offset, limit };
}

function assertNotificationId(notificationId: number): void {
  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    throw new RangeError("Stripe notification ID must be a positive integer.");
  }
}

export async function fetchStripeNotifications(
  params: StripeNotificationListParams = {},
): Promise<StripeNotificationRead[]> {
  const { offset, limit } = normalizeListParams(params);
  const query = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  return parseStripeNotificationList(
    await request(`${STRIPE_NOTIFICATION_PATH}?${query}`),
  );
}

export async function fetchStripeNotification(
  notificationId: number,
): Promise<StripeNotificationRead> {
  assertNotificationId(notificationId);
  return parseStripeNotification(
    await request(`${STRIPE_NOTIFICATION_PATH}/${notificationId}`),
  );
}

export async function createStripeNotification(
  input: StripeNotificationCreate,
): Promise<StripeNotificationRead> {
  return parseStripeNotification(
    await request(STRIPE_NOTIFICATION_PATH, {
      method: "POST",
      body: JSON.stringify(normalizePayload(input, false)),
    }),
  );
}

export async function updateStripeNotification(
  notificationId: number,
  input: StripeNotificationUpdate,
): Promise<StripeNotificationRead> {
  assertNotificationId(notificationId);
  return parseStripeNotification(
    await request(`${STRIPE_NOTIFICATION_PATH}/${notificationId}`, {
      method: "PATCH",
      body: JSON.stringify(normalizePayload(input, true)),
    }),
  );
}

export async function deleteStripeNotification(
  notificationId: number,
): Promise<void> {
  assertNotificationId(notificationId);
  await request(`${STRIPE_NOTIFICATION_PATH}/${notificationId}`, {
    method: "DELETE",
  });
}
