import "server-only"

import type { EsimCreate, EsimListParams, EsimRead, EsimRefreshResult, EsimUpdate } from "./types"

export type { EsimCreate, EsimListParams, EsimRead, EsimRefreshResult, EsimUpdate } from "./types"

type ApiErrorBody = { detail?: unknown }

export class EsimsApiError extends Error {
  readonly status: number
  readonly detail: unknown

  constructor(status: number, statusText: string, detail?: unknown) {
    super(getApiErrorMessage(status, statusText, detail))
    this.name = "EsimsApiError"
    this.status = status
    this.detail = detail
  }
}

function getApiErrorMessage(status: number, statusText: string, detail: unknown): string {
  if (typeof detail === "string" && detail.trim()) return detail
  if (isRecord(detail) && typeof detail.message === "string" && detail.message.trim()) {
    return detail.message
  }
  if (Array.isArray(detail)) {
    const messages = detail
      .filter(isRecord)
      .map((issue) => issue.msg)
      .filter((message): message is string => typeof message === "string" && message.trim().length > 0)
    if (messages.length > 0) return messages.join("; ")
  }
  return `eSIMs API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`
}

const ESIM_PATH = "/api/esims"
const DEFAULT_OFFSET = 0
const DEFAULT_LIMIT = 100

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL
  if (!value?.trim()) {
    throw new Error("The eSIM API is not configured. Set CORE_API_URL to the Core API origin.")
  }

  try {
    return new URL(value).toString().replace(/\/$/, "")
  } catch {
    throw new Error("CORE_API_URL must be a valid absolute URL.")
  }
}

function getRequestHeaders(hasBody: boolean): Headers {
  const headers = new Headers({ Accept: "application/json" })
  if (hasBody) headers.set("Content-Type", "application/json")

  const accessClientId = process.env.CF_ACCESS_CLIENT_ID
  const accessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET
  if (accessClientId && accessClientSecret) {
    headers.set("CF-Access-Client-Id", accessClientId)
    headers.set("CF-Access-Client-Secret", accessClientSecret)
  }
  return headers
}

async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: getRequestHeaders(init.body !== undefined),
  })

  if (!response.ok) {
    const body = await readJson(response)
    const detail = isRecord(body) ? (body as ApiErrorBody).detail : undefined
    throw new EsimsApiError(response.status, response.statusText, detail)
  }
  if (response.status === 204) return undefined

  const body = await readJson(response)
  if (body === undefined) throw new Error(`The Core API returned an empty ${response.status} response.`)
  return body
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new Error(`The Core API returned invalid JSON (${response.status}).`)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!isRecord(value)) throw new TypeError(`${label} must be an object.`)
}

function assertPositiveId(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) throw new RangeError(`${label} must be a positive integer.`)
}

function normalizeNullableString(value: unknown, field: string, max = 255): string | null {
  if (value === null) return null
  if (typeof value !== "string") throw new TypeError(`${field} must be a string or null.`)
  const normalized = value.trim()
  if (normalized.length < 1 || normalized.length > max) {
    throw new RangeError(`${field} must contain between 1 and ${max} characters after trimming.`)
  }
  return normalized
}

function normalizeNullableInteger(value: unknown, field: string): number | null {
  if (value === null) return null
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new TypeError(`${field} must be an integer or null.`)
  }
  return value
}

function normalizeNullableDatetime(value: unknown, field: string): string | null {
  if (value === null) return null
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new TypeError(`${field} must be an ISO-8601 datetime or null.`)
  }
  return new Date(value).toISOString()
}

function normalizeCreate(input: EsimCreate): EsimCreate {
  assertRecord(input, "eSIM create payload")
  assertPositiveId(input.account_id, "Account ID")
  if (input.user_id !== undefined && input.user_id !== null) assertPositiveId(input.user_id, "User ID")
  if (typeof input.imsi !== "string" || input.imsi.trim().length < 1 || input.imsi.trim().length > 255) {
    throw new RangeError("IMSI must contain between 1 and 255 characters after trimming.")
  }

  const payload: EsimCreate = {
    account_id: input.account_id,
    imsi: input.imsi.trim(),
  }
  if (input.user_id !== undefined) payload.user_id = input.user_id
  if (input.name !== undefined) payload.name = normalizeNullableString(input.name, "Name")
  if (input.isesim !== undefined) {
    if (input.isesim !== null && typeof input.isesim !== "boolean") throw new TypeError("isesim must be a boolean or null.")
    payload.isesim = input.isesim
  }
  if (input.createdate !== undefined) {
    if (input.createdate !== null && (typeof input.createdate !== "string" || Number.isNaN(Date.parse(input.createdate)))) throw new TypeError("createdate must be an ISO-8601 datetime or null.")
    payload.createdate = input.createdate
  }
  if (input.token !== undefined) payload.token = normalizeNullableString(input.token, "Token", 8)
  if (input.networkstatus !== undefined) payload.networkstatus = normalizeNullableString(input.networkstatus, "Network status")
  if (input.balance !== undefined) {
    if (input.balance !== null && (typeof input.balance !== "number" || !Number.isFinite(input.balance))) throw new TypeError("Balance must be a finite number or null.")
    payload.balance = input.balance
  }
  if (input.use_account_for_charging !== undefined) {
    if (typeof input.use_account_for_charging !== "boolean") throw new TypeError("use_account_for_charging must be a boolean.")
    payload.use_account_for_charging = input.use_account_for_charging
  }
  for (const field of ["smdpserver", "activationcode", "imei", "imei_device"] as const) {
    if (input[field] !== undefined) payload[field] = normalizeNullableString(input[field], field)
  }
  if (input.allow_data !== undefined) {
    if (input.allow_data !== null && typeof input.allow_data !== "boolean") throw new TypeError("allow_data must be a boolean or null.")
    payload.allow_data = input.allow_data
  }
  for (const field of ["mobileplanid", "lastcellid", "lastlac"] as const) {
    if (input[field] !== undefined) payload[field] = normalizeNullableInteger(input[field], field)
  }
  for (const field of ["activationdate", "lastusagedate", "lastnetworkdate"] as const) {
    if (input[field] !== undefined) payload[field] = normalizeNullableDatetime(input[field], field)
  }
  for (const field of ["subscriber_status", "lastmcc", "lastmnc", "lastrat"] as const) {
    if (input[field] !== undefined) payload[field] = normalizeNullableString(input[field], field)
  }
  return payload
}

function normalizeUpdate(input: EsimUpdate): EsimUpdate {
  assertRecord(input, "eSIM update payload")
  const payload: EsimUpdate = {}
  if (input.user_id !== undefined) {
    if (input.user_id !== null) assertPositiveId(input.user_id, "User ID")
    payload.user_id = input.user_id
  }
  if (input.account_id !== undefined) {
    assertPositiveId(input.account_id, "Account ID")
    payload.account_id = input.account_id
  }
  if (input.imsi !== undefined) {
    if (typeof input.imsi !== "string" || input.imsi.trim().length < 1 || input.imsi.trim().length > 255) {
      throw new RangeError("IMSI must contain between 1 and 255 characters after trimming.")
    }
    payload.imsi = input.imsi.trim()
  }
  if (input.name !== undefined) payload.name = normalizeNullableString(input.name, "Name")
  if (input.token !== undefined) payload.token = normalizeNullableString(input.token, "Token", 8)
  if (input.networkstatus !== undefined) payload.networkstatus = normalizeNullableString(input.networkstatus, "Network status")
  for (const field of ["smdpserver", "activationcode", "imei", "imei_device"] as const) {
    if (input[field] !== undefined) payload[field] = normalizeNullableString(input[field], field)
  }
  if (input.createdate !== undefined) {
    if (input.createdate !== null && (typeof input.createdate !== "string" || Number.isNaN(Date.parse(input.createdate)))) throw new TypeError("createdate must be an ISO-8601 datetime or null.")
    payload.createdate = input.createdate
  }
  if (input.balance !== undefined) {
    if (input.balance !== null && (typeof input.balance !== "number" || !Number.isFinite(input.balance))) throw new TypeError("Balance must be a finite number or null.")
    payload.balance = input.balance
  }
  for (const field of ["isesim", "allow_data"] as const) {
    if (input[field] !== undefined && input[field] !== null && typeof input[field] !== "boolean") throw new TypeError(`${field} must be a boolean or null.`)
    if (input[field] !== undefined) payload[field] = input[field]
  }
  if (input.use_account_for_charging !== undefined) {
    if (typeof input.use_account_for_charging !== "boolean") throw new TypeError("use_account_for_charging must be a boolean.")
    payload.use_account_for_charging = input.use_account_for_charging
  }
  for (const field of ["mobileplanid", "lastcellid", "lastlac"] as const) {
    if (input[field] !== undefined) payload[field] = normalizeNullableInteger(input[field], field)
  }
  for (const field of ["activationdate", "lastusagedate", "lastnetworkdate"] as const) {
    if (input[field] !== undefined) payload[field] = normalizeNullableDatetime(input[field], field)
  }
  for (const field of ["subscriber_status", "lastmcc", "lastmnc", "lastrat"] as const) {
    if (input[field] !== undefined) payload[field] = normalizeNullableString(input[field], field)
  }
  return payload
}

function parseEsim(value: unknown): EsimRead {
  assertRecord(value, "eSIM response")
  const nullableString = (field: string) => value[field] === null || typeof value[field] === "string"
  const id = value.id
  const userId = value.user_id
  const accountId = value.account_id
  if (
    typeof id !== "number" || !Number.isInteger(id) || id <= 0 ||
    (userId !== null && (typeof userId !== "number" || !Number.isInteger(userId))) ||
    typeof accountId !== "number" || !Number.isInteger(accountId) || accountId <= 0 ||
    typeof value.imsi !== "string" || !nullableString("name") ||
    (value.isesim !== null && typeof value.isesim !== "boolean") ||
    !nullableString("createdate") || !nullableString("token") || !nullableString("networkstatus") ||
    (value.balance !== null && (typeof value.balance !== "number" || !Number.isFinite(value.balance))) ||
    typeof value.use_account_for_charging !== "boolean" ||
    !nullableString("smdpserver") || !nullableString("activationcode") || !nullableString("imei") ||
    !nullableString("imei_device") || (value.allow_data !== null && typeof value.allow_data !== "boolean") ||
    (value.mobileplanid !== null && (typeof value.mobileplanid !== "number" || !Number.isInteger(value.mobileplanid))) ||
    !nullableString("activationdate") || !nullableString("lastusagedate") || !nullableString("subscriber_status") ||
    !nullableString("lastnetworkdate") || !nullableString("lastmcc") || !nullableString("lastmnc") ||
    (value.lastcellid !== null && (typeof value.lastcellid !== "number" || !Number.isInteger(value.lastcellid))) ||
    (value.lastlac !== null && (typeof value.lastlac !== "number" || !Number.isInteger(value.lastlac))) ||
    !nullableString("lastrat")
  ) throw new TypeError("The Core API returned an invalid eSIM.")
  return value as EsimRead
}

function parseEsimList(value: unknown): EsimRead[] {
  if (!Array.isArray(value)) throw new TypeError("The Core API returned an invalid eSIM list.")
  return value.map(parseEsim)
}

function parseEsimRefreshResult(value: unknown): EsimRefreshResult {
  assertRecord(value, "eSIM refresh response")
  const nullableStringFields = [
    "smdpserver", "activationcode", "subscriber_status", "lastmcc", "lastmnc",
    "imei", "imei_device", "lastrat",
  ] as const
  const nullableBooleanFields = ["isesim", "use_account_for_charging", "allow_data"] as const
  const nullableIntegerFields = ["mobileplanid", "lastcellid", "lastlac"] as const
  const nullableDatetimeFields = ["activationdate", "lastusagedate", "lastnetworkdate"] as const

  if (
    typeof value.id !== "number" || !Number.isInteger(value.id) || value.id <= 0 ||
    typeof value.imsi !== "string" ||
    (value.account_id !== null && (typeof value.account_id !== "number" || !Number.isInteger(value.account_id) || value.account_id <= 0)) ||
    (value.balance !== null && (typeof value.balance !== "number" || !Number.isFinite(value.balance))) ||
    nullableStringFields.some((field) => value[field] !== null && typeof value[field] !== "string") ||
    nullableBooleanFields.some((field) => value[field] !== null && typeof value[field] !== "boolean") ||
    nullableIntegerFields.some((field) => value[field] !== null && (typeof value[field] !== "number" || !Number.isInteger(value[field]))) ||
    nullableDatetimeFields.some((field) => value[field] !== null && (typeof value[field] !== "string" || Number.isNaN(Date.parse(value[field]))))
  ) throw new TypeError("The Core API returned an invalid eSIM refresh result.")

  return value as EsimRefreshResult
}

/** Refreshes and saves the eSIMs for an existing local account. */
export async function refreshEsimsForAccount(accountId: number): Promise<EsimRefreshResult[]> {
  assertPositiveId(accountId, "Account ID")
  const body = await request(`${ESIM_PATH}/refresh/${accountId}`, { method: "POST" })
  if (!Array.isArray(body)) throw new TypeError("The Core API returned an invalid eSIM refresh list.")
  return body.map(parseEsimRefreshResult)
}

export async function fetchEsims(params: EsimListParams = {}): Promise<EsimRead[]> {
  const offset = params.offset ?? DEFAULT_OFFSET
  const limit = params.limit ?? DEFAULT_LIMIT
  if (!Number.isInteger(offset) || offset < 0) throw new RangeError("eSIM list offset must be a non-negative integer.")
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError("eSIM list limit must be an integer from 1 to 100.")
  const query = new URLSearchParams({ offset: String(offset), limit: String(limit) })
  return parseEsimList(await request(`${ESIM_PATH}?${query}`))
}

export async function fetchEsim(id: number): Promise<EsimRead> {
  assertPositiveId(id, "eSIM ID")
  return parseEsim(await request(`${ESIM_PATH}/${id}`))
}

export async function createEsim(input: EsimCreate): Promise<EsimRead> {
  return parseEsim(await request(ESIM_PATH, { method: "POST", body: JSON.stringify(normalizeCreate(input)) }))
}

export async function updateEsim(id: number, input: EsimUpdate): Promise<EsimRead> {
  assertPositiveId(id, "eSIM ID")
  return parseEsim(await request(`${ESIM_PATH}/${id}`, { method: "PATCH", body: JSON.stringify(normalizeUpdate(input)) }))
}

export async function deleteEsim(id: number): Promise<void> {
  assertPositiveId(id, "eSIM ID")
  await request(`${ESIM_PATH}/${id}`, { method: "DELETE" })
}
