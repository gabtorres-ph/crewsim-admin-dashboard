
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

export type EsimSortKey = 'id' | 'user' | 'imsi'
