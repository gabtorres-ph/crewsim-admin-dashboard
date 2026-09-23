/** Data required by POST /api/accounts. */
export type AccountCreate = {
  name: string
  balance: number
}

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
