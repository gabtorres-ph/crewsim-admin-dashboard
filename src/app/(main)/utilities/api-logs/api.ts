import "server-only";

import type {
  RequestLogEntry,
  RequestLogListParams,
  RequestLogListResponse,
} from "./types";

export type {
  RequestLogEntry,
  RequestLogListParams,
  RequestLogListResponse,
} from "./types";

type ApiErrorBody = { detail?: unknown };

export class RequestLogsApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, statusText: string, detail?: unknown) {
    super(
      typeof detail === "string" && detail.length > 0
        ? detail
        : `Request logs API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`,
    );
    this.name = "RequestLogsApiError";
    this.status = status;
    this.detail = detail;
  }
}

const REQUEST_LOGS_PATH = "/api/utils/request-logs";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL;
  if (!value?.trim()) {
    throw new Error(
      "The request logs API is not configured. Set CORE_API_URL to the Core API origin.",
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

async function request(path: string): Promise<unknown> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: getRequestHeaders(),
  });
  if (!response.ok) {
    const body = await readJson(response);
    const detail = isRecord(body) ? (body as ApiErrorBody).detail : undefined;
    throw new RequestLogsApiError(
      response.status,
      response.statusText,
      detail,
    );
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

function readString(value: unknown, field: string): string {
  if (typeof value !== "string")
    throw new TypeError(`${field} must be a string.`);
  return value;
}

function readNullableString(value: unknown, field: string): string | null {
  return value === null || value === undefined
    ? null
    : readString(value, field);
}

function readInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new TypeError(`${field} must be an integer.`);
  }
  return value;
}

function readNullableInteger(value: unknown, field: string): number | null {
  return value === null || value === undefined
    ? null
    : readInteger(value, field);
}

function readBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean")
    throw new TypeError(`${field} must be a boolean.`);
  return value;
}

function readNullableBoolean(value: unknown, field: string): boolean | null {
  return value === null || value === undefined
    ? null
    : readBoolean(value, field);
}

function parseRequestLog(value: unknown): RequestLogEntry {
  assertRecord(value, "Request log response");
  try {
    return {
      request_id: readString(value.request_id, "request_id"),
      ts: readInteger(value.ts, "ts"),
      timestamp: readNullableString(value.timestamp, "timestamp"),
      caller_ip: readString(value.caller_ip, "caller_ip"),
      user_id: readString(value.user_id, "user_id"),
      method: readString(value.method, "method"),
      path: readString(value.path, "path"),
      status: readInteger(value.status, "status"),
      duration_ms: readInteger(value.duration_ms, "duration_ms"),
      content_type: readNullableString(value.content_type, "content_type"),
      req_body_len: readInteger(value.req_body_len, "req_body_len"),
      req_body_truncated: readBoolean(
        value.req_body_truncated,
        "req_body_truncated",
      ),
      req_body_gzip: readNullableBoolean(value.req_body_gzip, "req_body_gzip")
        ?? false,
      resp_content_type: readNullableString(
        value.resp_content_type,
        "resp_content_type",
      ),
      resp_body_len: readNullableInteger(value.resp_body_len, "resp_body_len"),
      resp_body_truncated: readNullableBoolean(
        value.resp_body_truncated,
        "resp_body_truncated",
      ),
      resp_body_gzip: readNullableBoolean(
        value.resp_body_gzip,
        "resp_body_gzip",
      ),
    };
  } catch {
    throw new TypeError("The Core API returned an invalid request log record.");
  }
}

function parseRequestLogList(value: unknown): RequestLogListResponse {
  assertRecord(value, "Request log list response");
  if (!Array.isArray(value.items)) {
    throw new TypeError("The Core API returned an invalid request log list.");
  }
  return {
    items: value.items.map(parseRequestLog),
    total: readInteger(value.total, "total"),
    page: readInteger(value.page, "page"),
    limit: readInteger(value.limit, "limit"),
  };
}

function normalizeListParams(params: RequestLogListParams): {
  page: number;
  limit: number;
} {
  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError("Request log list page must be a positive integer.");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new RangeError(
      `Request log list limit must be an integer from 1 to ${MAX_LIMIT}.`,
    );
  }
  return { page, limit };
}

export async function fetchRequestLogs(
  params: RequestLogListParams = {},
): Promise<RequestLogListResponse> {
  const { page, limit } = normalizeListParams(params);
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return parseRequestLogList(await request(`${REQUEST_LOGS_PATH}?${query}`));
}
