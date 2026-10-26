import "server-only";

import type {
  RoamingNetworkCode,
  RoamingPlanDetailListParams,
  RoamingPlanDetailRead,
} from "./types";

const API_PREFIX = (process.env.CORE_API_PREFIX ?? "/api").replace(/\/+$/, "");
const ROAMING_PLAN_DETAILS_PATH = `${API_PREFIX}/roaming-plans/details`;
const DECIMAL_PATTERN = /^-?\d+(?:\.\d+)?$/;

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL;
  if (!value?.trim()) {
    throw new Error(
      "The roaming plan details API is not configured. Set CORE_API_URL to the Core API origin.",
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

async function request(
  path: string,
  options: { method?: "GET" | "POST"; allowEmpty?: boolean } = {},
): Promise<unknown> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? "GET",
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
          : `Roaming plan details API request failed with status ${response.status}.`;
    throw new Error(message);
  }

  if (body === undefined && !options.allowEmpty) {
    throw new Error(
      `The Core API returned an empty ${response.status} response.`,
    );
  }
  return body;
}

function parseNetworkCode(value: unknown): RoamingNetworkCode {
  if (
    !isRecord(value) ||
    typeof value.mcc !== "string" ||
    typeof value.mnc !== "string"
  ) {
    throw new TypeError("The Core API returned an invalid MCC/MNC record.");
  }
  return { mcc: value.mcc, mnc: value.mnc };
}

function parseRoamingPlanDetail(value: unknown): RoamingPlanDetailRead {
  if (
    !isRecord(value) ||
    typeof value.roaming_plan_rule_id !== "number" ||
    !Number.isInteger(value.roaming_plan_rule_id) ||
    typeof value.roaming_plan_id !== "number" ||
    !Number.isInteger(value.roaming_plan_id) ||
    typeof value.network_id !== "number" ||
    !Number.isInteger(value.network_id) ||
    typeof value.continent !== "string" ||
    typeof value.country_name !== "string" ||
    typeof value.country_iso2 !== "string" ||
    typeof value.operator_name !== "string" ||
    !Array.isArray(value.mcc_mncs) ||
    !Array.isArray(value.tadigs) ||
    !value.tadigs.every((tadig) => typeof tadig === "string") ||
    typeof value.active !== "boolean" ||
    typeof value.data_rate !== "string" ||
    !DECIMAL_PATTERN.test(value.data_rate) ||
    typeof value.start_date !== "string"
  ) {
    throw new TypeError(
      "The Core API returned an invalid roaming plan detail record.",
    );
  }

  return {
    roaming_plan_rule_id: value.roaming_plan_rule_id,
    roaming_plan_id: value.roaming_plan_id,
    network_id: value.network_id,
    continent: value.continent,
    country_name: value.country_name,
    country_iso2: value.country_iso2,
    operator_name: value.operator_name,
    mcc_mncs: value.mcc_mncs.map(parseNetworkCode),
    tadigs: value.tadigs,
    active: value.active,
    data_rate: value.data_rate,
    start_date: value.start_date,
  };
}

export async function fetchRoamingPlanDetails(
  params: RoamingPlanDetailListParams = {},
): Promise<RoamingPlanDetailRead[]> {
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 100;
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError(
      "Roaming plan detail list offset must be a non-negative integer.",
    );
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError(
      "Roaming plan detail list limit must be an integer from 1 to 100.",
    );
  }

  const query = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  const body = await request(`${ROAMING_PLAN_DETAILS_PATH}?${query}`);
  if (!Array.isArray(body)) {
    throw new TypeError(
      "The Core API returned an invalid roaming plan detail list.",
    );
  }
  return body.map(parseRoamingPlanDetail);
}

export async function refreshRoamingPlanDetails(
  tariffId: number,
): Promise<void> {
  if (!Number.isInteger(tariffId) || tariffId < 1) {
    throw new RangeError("Tariff ID must be a positive integer.");
  }

  const query = new URLSearchParams({ tariff_id: String(tariffId) });
  await request(`${ROAMING_PLAN_DETAILS_PATH}/refresh?${query}`, {
    method: "POST",
    allowEmpty: true,
  });
}
