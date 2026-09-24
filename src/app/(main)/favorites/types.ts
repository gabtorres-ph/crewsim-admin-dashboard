/** Data required by POST /api/favorites. */
export type FavoriteCreate = {
  user_id: number
  country: string
}

/** Favorite representation returned by the API. */
export type FavoriteRead = {
  id: number
  user_id: number
  country: string
}

export type FavoriteListParams = {
  offset?: number
  limit?: number
}
