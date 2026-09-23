import "server-only"

import type { UserCreate, UserListParams, UserRead, UserUpdate } from "./types"

export type { UserCreate, UserListParams, UserRead, UserUpdate } from "./types"

type ApiErrorBody = { detail?: unknown }

export class UsersApiError extends Error {
  readonly status: number
  readonly detail: unknown

  constructor(status: number, statusText: string, detail?: unknown) {
    super(
      typeof detail === "string" && detail.length > 0
        ? detail
        : `Users API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`,
    )
    this.name = "UsersApiError"
    this.status = status
    this.detail = detail
  }
}

const USER_PATH = "/api/users"
const DEFAULT_OFFSET = 0
const DEFAULT_LIMIT = 100

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL
  if (!value?.trim()) {
    throw new Error("The users API is not configured. Set CORE_API_URL to the Core API origin.")
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
    throw new UsersApiError(response.status, response.statusText, detail)
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

function assertUserId(value: number): void {
  if (!Number.isInteger(value) || value <= 0) throw new RangeError("User ID must be a positive integer.")
}

function normalizeRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string") throw new TypeError(`${field} must be a string.`)
  const normalized = value.trim()
  if (normalized.length < 1 || normalized.length > 255) {
    throw new RangeError(`${field} must contain between 1 and 255 characters after trimming.`)
  }
  return normalized
}

function normalizeNullableString(value: unknown, field: string, max = 255): string | null {
  if (value === null) return null
  if (typeof value !== "string") throw new TypeError(`${field} must be a string or null.`)
  const normalized = value.trim()
  if (normalized.length > max) throw new RangeError(`${field} must contain at most ${max} characters.`)
  return normalized
}

function normalizeNullableDate(value: unknown, field: string): string | null {
  if (value === null) return null
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new TypeError(`${field} must be an ISO datetime or null.`)
  }
  return value
}

function normalizeNullableBoolean(value: unknown, field: string): boolean | null {
  if (value === null || typeof value === "boolean") return value
  throw new TypeError(`${field} must be a boolean or null.`)
}

function normalizeNullablePositiveId(value: unknown): number | null {
  if (value === null) return null
  assertUserId(value as number)
  return value as number
}

function normalizePayload(input: UserCreate | UserUpdate, required: boolean): UserCreate | UserUpdate {
  assertRecord(input, "User payload")
  const payload: UserCreate | UserUpdate = {}

  for (const field of ["email", "language", "currency", "timezone"] as const) {
    if (required || input[field] !== undefined) payload[field] = normalizeRequiredString(input[field], field)
  }

  for (const field of ["firstname", "lastname", "airline", "position", "stripeid", "logtoid"] as const) {
    if (input[field] !== undefined) payload[field] = normalizeNullableString(input[field], field)
  }
  if (input.referralcode !== undefined) {
    const referralcode = normalizeNullableString(input.referralcode, "referralcode", 8)
    if (referralcode !== null && referralcode.length < 1) throw new RangeError("referralcode must contain between 1 and 8 characters.")
    payload.referralcode = referralcode
  }
  if (input.referredby !== undefined) payload.referredby = normalizeNullablePositiveId(input.referredby)
  for (const field of ["createdate", "rateus"] as const) {
    if (input[field] !== undefined) payload[field] = normalizeNullableDate(input[field], field)
  }
  for (const field of ["newsletter", "smsnotification"] as const) {
    if (input[field] !== undefined) payload[field] = normalizeNullableBoolean(input[field], field)
  }
  return payload
}

function parseUser(value: unknown): UserRead {
  assertRecord(value, "User response")
  const requiredStrings = ["email", "language", "currency", "timezone"]
  const nullableStrings = ["firstname", "lastname", "airline", "position", "referralcode", "stripeid", "logtoid", "createdate", "rateus"]
  if (typeof value.id !== "number" || !Number.isInteger(value.id) || value.id <= 0) throw new TypeError("The Core API returned an invalid user ID.")
  if (requiredStrings.some((field) => typeof value[field] !== "string")) throw new TypeError("The Core API returned an invalid user.")
  if (nullableStrings.some((field) => value[field] !== null && typeof value[field] !== "string")) throw new TypeError("The Core API returned an invalid user.")
  if (value.referredby !== null && (typeof value.referredby !== "number" || !Number.isInteger(value.referredby) || value.referredby <= 0)) throw new TypeError("The Core API returned an invalid user referral.")
  if (["newsletter", "smsnotification"].some((field) => value[field] !== null && typeof value[field] !== "boolean")) throw new TypeError("The Core API returned invalid user notification settings.")
  return value as UserRead
}

function parseUserList(value: unknown): UserRead[] {
  if (!Array.isArray(value)) throw new TypeError("The Core API returned an invalid user list.")
  return value.map(parseUser)
}

export async function fetchUsers(params: UserListParams = {}): Promise<UserRead[]> {
  const offset = params.offset ?? DEFAULT_OFFSET
  const limit = params.limit ?? DEFAULT_LIMIT
  if (!Number.isInteger(offset) || offset < 0) throw new RangeError("User list offset must be a non-negative integer.")
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError("User list limit must be an integer from 1 to 100.")
  const query = new URLSearchParams({ offset: offset.toString(), limit: limit.toString() })
  return parseUserList(await request(`${USER_PATH}?${query}`))
}

export async function fetchUser(userId: number): Promise<UserRead> {
  assertUserId(userId)
  return parseUser(await request(`${USER_PATH}/${userId}`))
}

export async function createUser(input: UserCreate): Promise<UserRead> {
  return parseUser(await request(USER_PATH, { method: "POST", body: JSON.stringify(normalizePayload(input, true)) }))
}

export async function updateUser(userId: number, input: UserUpdate): Promise<UserRead> {
  assertUserId(userId)
  return parseUser(await request(`${USER_PATH}/${userId}`, { method: "PATCH", body: JSON.stringify(normalizePayload(input, false)) }))
}

export async function deleteUser(userId: number): Promise<void> {
  assertUserId(userId)
  await request(`${USER_PATH}/${userId}`, { method: "DELETE" })
}
