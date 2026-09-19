import { delay, http, HttpResponse } from 'msw'

import type { FavoriteCreate, FavoriteRead } from '../model'
import { hasMockUserId } from '@/features/users/mocks'
import { mockFavorites } from './data'

const FAVORITES_PATH = '*/favorites'
const FAVORITE_PATH = '*/favorites/:id'
const USER_FAVORITES_PATH = '*/users/:id/favorites'
const MOCK_DELAY_MS = 250

let favorites: FavoriteRead[] = []

export function resetMockFavorites() {
  favorites = mockFavorites.map((favorite) => ({ ...favorite }))
}

function parseId(value: string | readonly string[] | undefined) {
  const id = Number(value)
  return Number.isInteger(id) ? id : null
}

function paginate<TItem>(items: TItem[], request: Request) {
  const url = new URL(request.url)
  const offset = Number(url.searchParams.get('offset') ?? 0)
  const limit = Number(url.searchParams.get('limit') ?? 100)

  return items.slice(offset, offset + limit)
}

async function readFavoriteInput(request: Request) {
  try {
    const body = (await request.json()) as Partial<FavoriteCreate>

    if (
      typeof body.user_id !== 'number' ||
      !Number.isInteger(body.user_id) ||
      body.user_id <= 0 ||
      typeof body.country !== 'string' ||
      body.country.trim().length === 0
    ) {
      return null
    }

    return { user_id: body.user_id, country: body.country.trim() }
  } catch {
    return null
  }
}

resetMockFavorites()

export const favoriteHandlers = [
  http.get(FAVORITES_PATH, async ({ request }) => {
    await delay(MOCK_DELAY_MS)
    const url = new URL(request.url)
    const userId = Number(url.searchParams.get('user_id'))
    const rows = Number.isInteger(userId) && userId > 0
      ? favorites.filter((favorite) => favorite.user_id === userId)
      : favorites

    return HttpResponse.json(paginate(rows, request).map((row) => ({ ...row })))
  }),

  http.get(USER_FAVORITES_PATH, async ({ params, request }) => {
    await delay(MOCK_DELAY_MS)
    const userId = parseId(params.id)

    if (userId === null || !hasMockUserId(userId)) {
      return HttpResponse.json({ detail: 'User not found.' }, { status: 404 })
    }

    return HttpResponse.json(
      paginate(
        favorites.filter((favorite) => favorite.user_id === userId),
        request,
      ).map((row) => ({ ...row })),
    )
  }),

  http.get(FAVORITE_PATH, async ({ params }) => {
    await delay(MOCK_DELAY_MS)
    const id = parseId(params.id)
    const favorite = id === null
      ? undefined
      : favorites.find((candidate) => candidate.id === id)

    if (!favorite) {
      return HttpResponse.json({ detail: 'Favorite not found.' }, { status: 404 })
    }

    return HttpResponse.json({ ...favorite })
  }),

  http.post(FAVORITES_PATH, async ({ request }) => {
    await delay(MOCK_DELAY_MS)
    const input = await readFavoriteInput(request)

    if (!input) {
      return HttpResponse.json({ detail: 'User and country are required.' }, { status: 422 })
    }

    if (!hasMockUserId(input.user_id)) {
      return HttpResponse.json({ detail: 'User not found.' }, { status: 404 })
    }

    const favorite: FavoriteRead = {
      ...input,
      id: Math.max(0, ...favorites.map(({ id }) => id)) + 1,
    }

    favorites.push(favorite)
    return HttpResponse.json({ ...favorite }, { status: 201 })
  }),

  http.delete(FAVORITE_PATH, async ({ params }) => {
    await delay(MOCK_DELAY_MS)
    const id = parseId(params.id)
    const favoriteIndex = id === null
      ? -1
      : favorites.findIndex((favorite) => favorite.id === id)

    if (favoriteIndex === -1 || id === null) {
      return HttpResponse.json({ detail: 'Favorite not found.' }, { status: 404 })
    }

    favorites.splice(favoriteIndex, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
