import type { Esim, EsimInput } from '../model'
import { request } from '@/shared/api/request'

export type EsimResponse = {
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

type EsimRequest = {
  user_id?: number
  account_id?: number
  imsi?: string
  name?: string
  isesim?: boolean
  createdate?: string
  token?: string
  networkstatus?: string
  balance?: number
  use_account_for_charging?: boolean
  smdpserver?: string
  activationcode?: string
  imei?: string
  imei_device?: string
  allow_data?: boolean
}

export type EsimListParams = {
  userId?: number
  offset?: number
  limit?: number
}

function setIfPresent<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: T[K] | null | undefined,
) {
  if (value !== null && value !== undefined) {
    target[key] = value
  }
}

function buildQuery(params: EsimListParams = {}) {
  const query = new URLSearchParams()

  if (params.userId !== undefined) {
    query.set('user_id', String(params.userId))
  }

  if (params.offset !== undefined) {
    query.set('offset', String(params.offset))
  }

  if (params.limit !== undefined) {
    query.set('limit', String(params.limit))
  }

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export function fromEsimResponse(esim: EsimResponse): Esim {
  return {
    id: esim.id,
    userId: esim.user_id,
    accountId: esim.account_id,
    imsi: esim.imsi,
    name: esim.name,
    isesim: esim.isesim,
    createdate: esim.createdate,
    token: esim.token,
    networkstatus: esim.networkstatus,
    balance: esim.balance,
    useAccountForCharging: esim.use_account_for_charging,
    smdpserver: esim.smdpserver,
    activationcode: esim.activationcode,
    imei: esim.imei,
    imeiDevice: esim.imei_device,
    allowData: esim.allow_data,
  }
}

function toRequest(input: EsimInput): EsimRequest {
  const payload: EsimRequest = {}

  setIfPresent(payload, 'user_id', input.userId ?? undefined)
  setIfPresent(payload, 'account_id', input.accountId)
  setIfPresent(payload, 'imsi', input.imsi)
  setIfPresent(payload, 'name', input.name)
  setIfPresent(payload, 'isesim', input.isesim)
  setIfPresent(payload, 'createdate', input.createdate)
  setIfPresent(payload, 'token', input.token)
  setIfPresent(payload, 'networkstatus', input.networkstatus)
  setIfPresent(payload, 'balance', input.balance)
  setIfPresent(
    payload,
    'use_account_for_charging',
    input.useAccountForCharging,
  )
  setIfPresent(payload, 'smdpserver', input.smdpserver)
  setIfPresent(payload, 'activationcode', input.activationcode)
  setIfPresent(payload, 'imei', input.imei)
  setIfPresent(payload, 'imei_device', input.imeiDevice)
  setIfPresent(payload, 'allow_data', input.allowData)

  return payload
}

export async function listEsims(
  params: EsimListParams = {},
): Promise<Esim[]> {
  const esims = await request<EsimResponse[]>(`/esims${buildQuery(params)}`)
  return esims.map(fromEsimResponse)
}

export async function createEsim(input: EsimInput): Promise<Esim> {
  const esim = await request<EsimResponse>('/esims', {
    method: 'POST',
    body: JSON.stringify(toRequest(input)),
  })

  return fromEsimResponse(esim)
}

export async function updateEsim(
  id: number,
  input: EsimInput,
): Promise<Esim> {
  const esim = await request<EsimResponse>(`/esims/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toRequest(input)),
  })

  return fromEsimResponse(esim)
}

export function deleteEsim(id: number): Promise<void> {
  return request<void>(`/esims/${id}`, {
    method: 'DELETE',
  })
}
