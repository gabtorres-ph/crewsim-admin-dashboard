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
  mobileplanid?: number | null
  activationdate?: string | null
  lastusagedate?: string | null
  subscriber_status?: string | null
  lastnetworkdate?: string | null
  lastmcc?: string | null
  lastmnc?: string | null
  lastcellid?: number | null
  lastlac?: number | null
  lastrat?: string | null
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
  mobileplanid: number | null
  activationdate: string | null
  lastusagedate: string | null
  subscriber_status: string | null
  lastnetworkdate: string | null
  lastmcc: string | null
  lastmnc: string | null
  lastcellid: number | null
  lastlac: number | null
  lastrat: string | null
}

export type EsimListParams = {
  offset?: number
  limit?: number
}

/** One stored period returned by GET /api/network-status/{imsi}. */
export type NetworkStatusRecord = {
  id: number
  sim_id: number
  imsi: string
  status: string
  start: string
  end: string | null
  profile_type: string
  status_modification: string
}

/** Data accepted by POST /api/esims/move-to-account. */
export type EsimMoveRequest = {
  source_account_id: number
  destination_account_id: number
  imsis: string[]
}

/** One item in the bare array returned by a successful account move. */
export type EsimMoveResult = {
  imsi: string
  account_id: number
}

export type EsimMoveValidationIssue = {
  loc: (string | number)[]
  msg: string
  type: string
}

/** Completed moves remain committed; the failed IMSI's provider state may be uncertain. */
export type EsimMoveProgress = {
  moved_imsis: string[]
  failed_imsi: string
  not_attempted_imsis: string[]
}

export type EsimMoveProviderErrorDetail = {
  message: string
  category: string
  provider_code: number | null
} & (
  | EsimMoveProgress
  | {
      moved_imsis?: never
      failed_imsi?: never
      not_attempted_imsis?: never
    }
)

/** Documented HTTP failures; missing progress fields do not imply that no move occurred. */
export type EsimMoveFailure =
  | { status: 422; detail: string | EsimMoveValidationIssue[] }
  | { status: 404 | 409 | 503; detail: string }
  | { status: 502; detail: EsimMoveProviderErrorDetail }

/** Saved eSIM returned by POST /api/esims/refresh/{account_id}. */
export type EsimRefreshResult = {
  id: number
  imsi: string
  account_id: number | null
  isesim: boolean | null
  balance: number | null
  use_account_for_charging: boolean | null
  smdpserver: string | null
  activationcode: string | null
  allow_data: boolean | null
  mobileplanid: number | null
  activationdate: string | null
  lastusagedate: string | null
  subscriber_status: string | null
  lastnetworkdate: string | null
  lastmcc: string | null
  lastmnc: string | null
  lastcellid: number | null
  lastlac: number | null
  imei: string | null
  imei_device: string | null
  lastrat: string | null
}
