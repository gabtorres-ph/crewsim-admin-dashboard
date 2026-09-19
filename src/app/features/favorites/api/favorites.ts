import { buildQuery, type ListParams, request } from '@/shared/api/request'
import type { FavoriteCreate, FavoriteRead } from '../model'

export type FavoriteListParams = ListParams & {
  userId?: number
}

export function listFavorites(
  params: FavoriteListParams = {},
): Promise<FavoriteRead[]> {
  return request<FavoriteRead[]>(
    `/favorites${buildQuery({
      offset: params.offset,
      limit: params.limit,
      user_id: params.userId,
    })}`,
  )
}

export function listUserFavorites(
  userId: number,
  params: ListParams = {},
): Promise<FavoriteRead[]> {
  return request<FavoriteRead[]>(
    `/users/${userId}/favorites${buildQuery(params)}`,
  )
}

export function getFavorite(id: number): Promise<FavoriteRead> {
  return request<FavoriteRead>(`/favorites/${id}`)
}

export function createFavorite(
  input: FavoriteCreate,
): Promise<FavoriteRead> {
  return request<FavoriteRead>('/favorites', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteFavorite(id: number): Promise<void> {
  return request<void>(`/favorites/${id}`, {
    method: 'DELETE',
  })
}
