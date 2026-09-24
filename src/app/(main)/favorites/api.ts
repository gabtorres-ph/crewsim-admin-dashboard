import "server-only"

import type { FavoriteCreate, FavoriteListParams, FavoriteRead } from "./types"

export type { FavoriteCreate, FavoriteListParams, FavoriteRead } from "./types"

type ApiErrorBody = { detail?: unknown }

export class FavoritesApiError extends Error {
  readonly status: number
  readonly detail: unknown

  constructor(status: number, statusText: string, detail?: unknown) {
    super(
      typeof detail === "string" && detail.length > 0
        ? detail
        : `Favorites API request failed with status ${status}${statusText ? ` ${statusText}` : ""}.`,
    )
    this.name = "FavoritesApiError"
    this.status = status
    this.detail = detail
  }
}

const FAVORITE_PATH = "/api/favorites"
const DEFAULT_OFFSET = 0
const DEFAULT_LIMIT = 100

function getApiBaseUrl(): string {
  const value = process.env.CORE_API_URL ?? process.env.CORE_API_INTERNAL_URL
  if (!value?.trim()) {
    throw new Error(
      "The favorites API is not configured. Set CORE_API_URL to the Core API origin.",
    )
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
    throw new FavoritesApiError(response.status, response.statusText, detail)
  }
  if (response.status === 204) return undefined

  const body = await readJson(response)
  if (body === undefined) {
    throw new Error(`The Core API returned an empty ${response.status} response.`)
  }
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

function assertPositiveInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${field} must be a positive integer.`)
  }
}

function normalizeCreate(input: FavoriteCreate): FavoriteCreate {
  if (!isRecord(input)) throw new TypeError("Favorite payload must be an object.")
  assertPositiveInteger(input.user_id as number, "User ID")

  if (typeof input.country !== "string") {
    throw new TypeError("Country must be a string.")
  }
  const country = input.country.trim()
  if (country.length < 1 || country.length > 255) {
    throw new RangeError(
      "Country must contain between 1 and 255 characters after trimming.",
    )
  }

  return { user_id: input.user_id, country }
}

function assertFavoriteId(favoriteId: number): void {
  assertPositiveInteger(favoriteId, "Favorite ID")
}

function parseFavorite(value: unknown): FavoriteRead {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    !Number.isInteger(value.id) ||
    value.id <= 0 ||
    typeof value.user_id !== "number" ||
    !Number.isInteger(value.user_id) ||
    value.user_id <= 0 ||
    typeof value.country !== "string"
  ) {
    throw new TypeError("The Core API returned an invalid favorite.")
  }
  return value as FavoriteRead
}

function parseFavoriteList(value: unknown): FavoriteRead[] {
  if (!Array.isArray(value)) {
    throw new TypeError("The Core API returned an invalid favorite list.")
  }
  return value.map(parseFavorite)
}

export async function fetchFavorites(
  params: FavoriteListParams = {},
): Promise<FavoriteRead[]> {
  const offset = params.offset ?? DEFAULT_OFFSET
  const limit = params.limit ?? DEFAULT_LIMIT
  if (!Number.isInteger(offset) || offset < 0) {
    throw new RangeError("Favorite list offset must be a non-negative integer.")
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError(
      "Favorite list limit must be an integer from 1 to 100.",
    )
  }

  const query = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  })
  return parseFavoriteList(await request(`${FAVORITE_PATH}?${query}`))
}

export async function createFavorite(input: FavoriteCreate): Promise<FavoriteRead> {
  return parseFavorite(
    await request(FAVORITE_PATH, {
      method: "POST",
      body: JSON.stringify(normalizeCreate(input)),
    }),
  )
}

export async function deleteFavorite(favoriteId: number): Promise<void> {
  assertFavoriteId(favoriteId)
  await request(`${FAVORITE_PATH}/${favoriteId}`, { method: "DELETE" })
}
