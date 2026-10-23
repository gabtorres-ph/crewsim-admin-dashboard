import "server-only";

import type {
  RoamingPlanListParams,
  RoamingPlanRead,
  RoamingPlanRefreshResult,
} from "./types";

const API_PREFIX = (process.env.CORE_API_PREFIX ?? "/api").replace(/\/+$/, "");
const ROAMING_PLANS_PATH = `${API_PREFIX}/roaming-plans`;

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL;
  if (!value?.trim()) {
    throw new Error(
      "The roaming plans API is not configured. Set CORE_API_URL to the Core API origin.",
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    if (!response.ok) return text;
    throw new Error(`The Core API returned invalid JSON (${response.status}).`);
  }
}

async function request(path: string, method = "GET"): Promise<unknown> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    cache: "no-store",
    headers: getRequestHeaders(),
  });
  const body = await readJson(response);

  if (!response.ok) {
    const detail = isRecord(body) && "detail" in body ? body.detail : body;
    const message =
      typeof detail === "string"
        ? detail
        : isRecord(detail) && typeof detail.message === "string"
          ? detail.message
          : `Roaming plans API request failed with status ${response.status}.`;
    const category = isRecord(detail) && typeof detail.category === "string"
      ? detail.category
      : undefined;
    const providerCode = isRecord(detail) && typeof detail.provider_code === "string"
      ? detail.provider_code
      : undefined;
    const context = [
      category && `category: ${category}`,
      providerCode && `provider code: ${providerCode}`,
    ].filter(Boolean).join("; ");
    throw new Error(context ? `${message} (${context})` : message);
  }

  if (body === undefined) {
    throw new Error(`The Core API returned an empty ${response.status} response.`);
  }
  return body;
}

function parseRoamingPlan(value: unknown): RoamingPlanRead {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    !Number.isInteger(value.id) ||
    (value.roaming_plan_name !== null &&
      typeof value.roaming_plan_name !== "string")
  ) {
    throw new TypeError("The Core API returned an invalid roaming plan record.");
  }

  return {
    id: value.id,
    roaming_plan_name: value.roaming_plan_name,
  };
}

function parseRefreshResult(value: unknown): RoamingPlanRefreshResult {
  if (!isRecord(value)) {
    throw new TypeError("The Core API returned an invalid roaming plan refresh result.");
  }

  const { fetched, created, updated, unchanged } = value;
  if (
    ![fetched, created, updated, unchanged].every(
      (count) => typeof count === "number" && Number.isInteger(count) && count >= 0,
    )
  ) {
    throw new TypeError("The Core API returned an invalid roaming plan refresh result.");
  }

  return {
    fetched: fetched as number,
    created: created as number,
    updated: updated as number,
    unchanged: unchanged as number,
  };
}

export async function fetchRoamingPlans(
  params: RoamingPlanListParams = {},
): Promise<RoamingPlanRead[]> {
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 100;
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError("Roaming plan list offset must be a non-negative integer.");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError("Roaming plan list limit must be an integer from 1 to 100.");
  }

  const query = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  const body = await request(`${ROAMING_PLANS_PATH}?${query}`);
  if (!Array.isArray(body)) {
    throw new TypeError("The Core API returned an invalid roaming plan list.");
  }
  return body.map(parseRoamingPlan);
}

export async function refreshRoamingPlans(): Promise<RoamingPlanRefreshResult> {
  return parseRefreshResult(await request(`${ROAMING_PLANS_PATH}/refresh`, "POST"));
}
