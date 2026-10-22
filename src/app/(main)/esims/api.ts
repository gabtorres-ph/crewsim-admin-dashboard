import "server-only"

import type {
  EsimCreate,
  EsimListParams,
  EsimMoveFailure,
  EsimMoveProviderErrorDetail,
  EsimMoveRequest,
  EsimMoveResult,
  EsimMoveValidationIssue,
  EsimRead,
  EsimRefreshResult,
  EsimUpdate,
} from "./types"

export type {
  EsimCreate,
  EsimListParams,
  EsimMoveFailure,
  EsimMoveRequest,
  EsimMoveResult,
  EsimRead,
  EsimRefreshResult,
  EsimUpdate,
} from "./types"

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

export class EsimMoveApiError extends EsimsApiError {
  readonly failure: EsimMoveFailure | undefined

  constructor(error: EsimsApiError) {
    super(error.status, "", error.detail)
    this.name = "EsimMoveApiError"
    this.message = error.message
    this.failure = parseEsimMoveFailure(error.status, error.detail)
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

const API_PREFIX = (process.env.CORE_API_PREFIX ?? "/api").replace(/\/+$/, "")
const ESIM_PATH = `${API_PREFIX}/esims`
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
    const body = await readJson(response).catch(() => undefined)
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

/** Validates and normalizes an eSIM update before a multi-request save begins. */
export function normalizeEsimUpdate(input: EsimUpdate): EsimUpdate {
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

function normalizeEsimMove(input: EsimMoveRequest): EsimMoveRequest {
  assertRecord(input, "eSIM move payload")
  assertPositiveId(input.source_account_id, "Source account ID")
  assertPositiveId(input.destination_account_id, "Destination account ID")
  if (input.source_account_id === input.destination_account_id) {
    throw new RangeError("Source and destination accounts must differ.")
  }
  if (!Array.isArray(input.imsis) || input.imsis.length === 0) {
    throw new RangeError("At least one IMSI is required.")
  }
  for (const imsi of input.imsis) {
    if (typeof imsi !== "string" || !/^[0-9]{5,15}$/.test(imsi)) {
      throw new RangeError("Each IMSI must be a string containing between 5 and 15 ASCII digits.")
    }
  }
  if (new Set(input.imsis).size !== input.imsis.length) {
    throw new RangeError("IMSIs must be unique.")
  }
  return {
    source_account_id: input.source_account_id,
    destination_account_id: input.destination_account_id,
    imsis: [...input.imsis],
  }
}

function parseEsimMoveResults(value: unknown, input: EsimMoveRequest): EsimMoveResult[] {
  if (!Array.isArray(value) || value.length !== input.imsis.length) {
    throw new TypeError("The Core API returned an invalid eSIM move result list.")
  }
  return value.map((result, index) => {
    if (
      !isRecord(result) ||
      typeof result.imsi !== "string" || result.imsi !== input.imsis[index] ||
      typeof result.account_id !== "number" || result.account_id !== input.destination_account_id
    ) throw new TypeError("The Core API returned an invalid eSIM move result.")
    return { imsi: result.imsi, account_id: result.account_id }
  })
}

function parseEsimMoveFailure(status: number, detail: unknown): EsimMoveFailure | undefined {
  if (status === 422) {
    if (typeof detail === "string") return { status, detail }
    if (
      Array.isArray(detail) && detail.every((issue) =>
        isRecord(issue) && Array.isArray(issue.loc) &&
        issue.loc.every((part: unknown) => typeof part === "string" || typeof part === "number") &&
        typeof issue.msg === "string" && typeof issue.type === "string",
      )
    ) return { status, detail: detail as EsimMoveValidationIssue[] }
  }
  if ((status === 404 || status === 409 || status === 503) && typeof detail === "string") {
    return { status, detail }
  }
  if (
    status === 502 && isRecord(detail) &&
    typeof detail.message === "string" && typeof detail.category === "string" &&
    (detail.provider_code === null || (typeof detail.provider_code === "number" && Number.isInteger(detail.provider_code)))
  ) {
    const withoutProgress = detail.moved_imsis === undefined && detail.failed_imsi === undefined && detail.not_attempted_imsis === undefined
    const withProgress =
      Array.isArray(detail.moved_imsis) && detail.moved_imsis.every((imsi: unknown) => typeof imsi === "string") &&
      typeof detail.failed_imsi === "string" &&
      Array.isArray(detail.not_attempted_imsis) && detail.not_attempted_imsis.every((imsi: unknown) => typeof imsi === "string")
    if (withoutProgress || withProgress) {
      return { status, detail: detail as EsimMoveProviderErrorDetail }
    }
  }
  return undefined
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

export async function refreshEsimByImsi(imsi: string): Promise<EsimRefreshResult> {
  if (typeof imsi !== "string" || !/^[0-9]{5,15}$/.test(imsi)) {
    throw new RangeError("IMSI must contain between 5 and 15 digits.")
  }
  return parseEsimRefreshResult(
    await request(`${ESIM_PATH}/${encodeURIComponent(imsi)}/refresh`, { method: "POST" }),
  )
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

/** Moves through the provider and commits each IMSI separately; never retry automatically. */
export async function moveEsimsToAccount(input: EsimMoveRequest): Promise<EsimMoveResult[]> {
  const payload = normalizeEsimMove(input)
  try {
    const body = await request(`${ESIM_PATH}/move-to-account`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return parseEsimMoveResults(body, payload)
  } catch (error) {
    if (error instanceof EsimsApiError) throw new EsimMoveApiError(error)
    throw error
  }
}

export async function updateEsim(id: number, input: EsimUpdate): Promise<EsimRead> {
  assertPositiveId(id, "eSIM ID")
  return parseEsim(await request(`${ESIM_PATH}/${id}`, { method: "PATCH", body: JSON.stringify(normalizeEsimUpdate(input)) }))
}

export async function deleteEsim(id: number): Promise<void> {
  assertPositiveId(id, "eSIM ID")
  await request(`${ESIM_PATH}/${id}`, { method: "DELETE" })
}
