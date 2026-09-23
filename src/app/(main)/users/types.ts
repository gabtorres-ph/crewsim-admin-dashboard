/** Data required by POST /api/users. */
export type UserCreate = {
  email: string
  language: string
  currency: string
  timezone: string
  firstname?: string | null
  lastname?: string | null
  airline?: string | null
  position?: string | null
  referralcode?: string | null
  referredby?: number | null
  stripeid?: string | null
  logtoid?: string | null
  createdate?: string | null
  newsletter?: boolean | null
  smsnotification?: boolean | null
  rateus?: string | null
}

/** Data accepted by PATCH /api/users/{userId}. */
export type UserUpdate = Partial<UserCreate>

/** User representation returned by the API. */
export type UserRead = {
  id: number
  email: string
  language: string
  currency: string
  timezone: string
  firstname: string | null
  lastname: string | null
  airline: string | null
  position: string | null
  referralcode: string | null
  referredby: number | null
  stripeid: string | null
  logtoid: string | null
  createdate: string | null
  newsletter: boolean | null
  smsnotification: boolean | null
  rateus: string | null
}

export type UserListParams = {
  offset?: number
  limit?: number
}
