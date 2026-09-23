/** Data accepted by POST /api/esims. */
export type EsimCreate = {
  user_id?: number | null
  account_id: number
  imsi: string
  name?: string | null
  isesim?: boolean | null
  createdate?: string | null
  token?: string | null
  networkstatus?: string | null
  balance?: number | null
  use_account_for_charging?: boolean
  smdpserver?: string | null
  activationcode?: string | null
  imei?: string | null
  imei_device?: string | null
  allow_data?: boolean | null
}

/** Data accepted by PATCH /api/esims/{id}. */
export type EsimUpdate = Partial<EsimCreate>

/** eSIM representation returned by the API. */
export type EsimRead = {
  id: number
  user_id: number | null
  account_id: number
  imsi: string
  name: string | null
  isesim: boolean | null
  createdate: string | null
  token: string | null
  networkstatus: string | null
  balance: number | null
  use_account_for_charging: boolean
  smdpserver: string | null
  activationcode: string | null
  imei: string | null
  imei_device: string | null
  allow_data: boolean | null
}

export type EsimListParams = {
  offset?: number
  limit?: number
}
