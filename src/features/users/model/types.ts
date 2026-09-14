
export type User = {
  id: number
  email: string
  currency: string
  language: string
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

export type UserCreate = {
  email: string
  currency: string
  language: string
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

export type UserUpdate = Partial<UserCreate>
export type UserRead = User
export type UserInput = UserCreate
export type UserUpdateInput = UserUpdate
