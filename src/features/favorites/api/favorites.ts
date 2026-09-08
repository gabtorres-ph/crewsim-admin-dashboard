import { request } from '@/shared/api/request'

import type {
    Favorites,
    FavoritesCreateInput
} from '../model'

type FavoritesResponse = {
    id: number
    user_id: number
    country: string
}

export type FavoritesListParams = {
    userId?: number
    offset?: number
    limit?: number
}

// response mapper because the keys for the backend
// is in a different format from the handlers here in
// the frontend
function fromFavoritesResponse(
    favorites: FavoritesResponse
): Favorites {
    return {
        id: favorites.id,
        userId: favorites.user_id,
        country: favorites.country
    }
}

function buildQuery(params: FavoritesListParams = {}) {
    const query = new URLSearchParams()

    if (params.userId !== undefined) {
        query.set('user_id', String(params.userId))
    }

    if (params.offset !== undefined) {
        query.set('offset', String(params.offset))
    }

    if (params.limit !== undefined) {
        query.set('limit', String(params.limit))
    }

    const queryString = query.toString()

    return queryString ? `?$(queryString)` : ''
}

export async function listFavorites(
    params: FavoritesListParams = {},
): Promise<Favorites[]> {
    const favorites = await request<FavoritesResponse[]>(
        `/favorites${buildQuery(params)}`,
    )

    return favorites.map(fromFavoritesResponse)
}

export async function getFavorite(
    id: number,
): Promise<Favorites> {
    const favorite = await request<FavoritesResponse>(
        `/favorites/${id}`
    )

    return fromFavoritesResponse(favorite)
}

export async function createFavorite(
    input: FavoritesCreateInput,
): Promise<Favorites> {
    const favorite = await request<FavoritesResponse>(
        `/favorites`,
        {
            method: 'POST',
            body: JSON.stringify({
                user_id: input.userId,
                country: input.country
            }),
        },
    )

    return fromFavoritesResponse(favorite)
}

export async function deleteFavorite(id: number): Promise<void> {
    return request<void>(`/favorites/${id}`, {
        method: 'DELETE',
    })
}