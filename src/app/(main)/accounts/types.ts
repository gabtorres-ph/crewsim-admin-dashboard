/** Data accepted by PATCH /api/accounts/{accountId}. */
export type AccountUpdate = {
  name?: string
  balance?: number
}

/** Account representation returned by the API. */
export type AccountRead = {
  id: number
  name: string
  balance: number
}

export type AccountListParams = {
  offset?: number
  limit?: number
}

/** Summary returned by POST /api/accounts/refresh. */
export type AccountRefreshResult = {
  fetched: number
  created: number
  updated: number
  unchanged: number
  deleted: number
  delinked_esims: number
}
