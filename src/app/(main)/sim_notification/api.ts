import "server-only";

import type {
  SimNotificationListParams,
  SimNotificationRead,
  SimNotificationType,
} from "./types";

export type { SimNotificationListParams, SimNotificationRead, SimNotificationType } from "./types";

type ApiErrorBody = { detail?: unknown };

export class SimNotificationsApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, statusText: string, detail?: unknown) {
    super(
      typeof detail === "string" && detail.length > 0
        ? detail
        : `SIM notifications API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`,
    );
    this.name = "SimNotificationsApiError";
    this.status = status;
    this.detail = detail;
  }
}

const SIM_NOTIFICATION_PATH = "/api/sim/notifications";
const VALID_TYPES = new Set<SimNotificationType>(["location", "ES2", "package"]);

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL;
  if (!value?.trim()) {
    throw new Error(
      "The SIM notifications API is not configured. Set CORE_API_URL to the Core API origin.",
    );
  }
  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error("CORE_API_URL must be a valid absolute URL.");
  }
}

function getRequestHeaders(): Headers {
  const headers = new Headers({ Accept: "application/json" });
  const accessClientId = process.env.CF_ACCESS_CLIENT_ID;
  const accessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET;
  if (accessClientId && accessClientSecret) {
    headers.set("CF-Access-Client-Id", accessClientId);
    headers.set("CF-Access-Client-Secret", accessClientSecret);
  }
  return headers;
}

async function request(path: string, method = "GET"): Promise<unknown> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    cache: "no-store",
    headers: getRequestHeaders(),
  });
  if (!response.ok) {
    const body = await readJson(response);
    const detail = isRecord(body) ? (body as ApiErrorBody).detail : undefined;
    throw new SimNotificationsApiError(response.status, response.statusText, detail);
  }
  if (response.status === 204) return undefined;

  const body = await readJson(response);
  if (body === undefined) {
    throw new Error(`The Core API returned an empty ${response.status} response.`);
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

function isStringOrNumber(value: unknown): value is string | number {
  return typeof value === "string" || typeof value === "number";
}

function assertNotificationId(notificationId: number): void {
  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    throw new RangeError("SIM notification ID must be a positive integer.");
  }
}

function parseNotification(value: unknown): SimNotificationRead {
  if (!isRecord(value)) throw new TypeError("SIM notification must be an object.");
  if (!Number.isInteger(value.id) || (value.id as number) <= 0) {
    throw new TypeError("The Core API returned an invalid SIM notification ID.");
  }
  if (typeof value.typ !== "string" || !VALID_TYPES.has(value.typ as SimNotificationType)) {
    throw new TypeError("The Core API returned an invalid SIM notification type.");
  }
  if (typeof value.imsi !== "string" || !/^\d{5,15}$/.test(value.imsi)) {
    throw new TypeError("The Core API returned an invalid SIM notification IMSI.");
  }
  if (value.provider !== "telcovision") {
    throw new TypeError("The Core API returned an invalid SIM notification provider.");
  }
  if (!isRecord(value.payload)) {
    throw new TypeError("The Core API returned an invalid SIM notification payload.");
  }
  if (
    (value.typ === "ES2" && !isStringOrNumber(value.payload.imsi)) ||
    (value.typ === "location" &&
      (!isRecord(value.payload.subscriber) ||
        !isStringOrNumber(value.payload.subscriber.imsi))) ||
    (value.typ === "package" &&
      (!isRecord(value.payload.subscriberPrepaidPackage) ||
        !isStringOrNumber(value.payload.subscriberPrepaidPackage.subscriberIMSI))
    )
  ) {
    throw new TypeError("The Core API returned an invalid provider payload.");
  }
  if (
    typeof value.createdate !== "string" ||
    Number.isNaN(Date.parse(value.createdate))
  ) {
    throw new TypeError("The Core API returned an invalid SIM notification date.");
  }

  return value as unknown as SimNotificationRead;
}

function normalizeListParams(params: SimNotificationListParams) {
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 100;
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError("SIM notification offset must be a non-negative integer.");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError("SIM notification limit must be an integer from 1 to 100.");
  }
  if (params.typ !== undefined && !VALID_TYPES.has(params.typ)) {
    throw new RangeError("SIM notification type must be location, ES2, or package.");
  }
  if (params.imsi !== undefined && !/^\d{5,15}$/.test(params.imsi)) {
    throw new RangeError("SIM notification IMSI must contain 5 to 15 digits.");
  }
  return { offset, limit };
}

export async function fetchSimNotifications(
  params: SimNotificationListParams = {},
): Promise<SimNotificationRead[]> {
  const { offset, limit } = normalizeListParams(params);
  const query = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  if (params.typ) query.set("typ", params.typ);
  if (params.imsi) query.set("imsi", params.imsi);

  const response = await request(`${SIM_NOTIFICATION_PATH}?${query.toString()}`);
  if (!Array.isArray(response)) {
    throw new TypeError("The Core API returned an invalid SIM notification list.");
  }
  return response.map(parseNotification);
}

export async function fetchSimNotification(
  notificationId: number,
): Promise<SimNotificationRead> {
  assertNotificationId(notificationId);
  return parseNotification(await request(`${SIM_NOTIFICATION_PATH}/${notificationId}`));
}

export async function deleteSimNotification(notificationId: number): Promise<void> {
  assertNotificationId(notificationId);
  await request(`${SIM_NOTIFICATION_PATH}/${notificationId}`, "DELETE");
}
