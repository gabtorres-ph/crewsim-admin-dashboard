
export type Esim = {
  id: number
  userId: number | null
  accountId: number
  imsi: string
  name: string | null
  isesim: boolean | null
  createdate: string | null
  token: string | null
  networkstatus: string | null
  balance: number | null
  useAccountForCharging: boolean
  smdpserver: string | null
  activationcode: string | null
  imei: string | null
  imeiDevice: string | null
  allowData: boolean | null
}

export type ESIMRead = {
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

export type ESIMCreate = {
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

export type ESIMUpdate = Partial<ESIMCreate>

export type EsimTableRow = Esim & {
  esim: Esim
  userLabel: string
  accountLabel: string
}

export type EsimCreateInput = {
  userId?: number | null
  accountId: number
  imsi: string
  name?: string | null
  isesim?: boolean | null
  createdate?: string | null
  token?: string | null
  networkstatus?: string | null
  balance?: number | null
  useAccountForCharging?: boolean
  smdpserver?: string | null
  activationcode?: string | null
  imei?: string | null
  imeiDevice?: string | null
  allowData?: boolean | null
}

export type EsimUpdateInput = Partial<EsimCreateInput>

export type EsimInput = {
  userId?: number | null
  accountId?: number
  imsi: string
  name?: string | null
  isesim?: boolean | null
  createdate?: string | null
  token?: string | null
  networkstatus?: string | null
  balance?: number | null
  useAccountForCharging?: boolean
  smdpserver?: string | null
  activationcode?: string | null
  imei?: string | null
  imeiDevice?: string | null
  allowData?: boolean | null
}
