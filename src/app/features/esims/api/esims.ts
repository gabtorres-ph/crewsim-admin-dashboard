import type {
  ESIMCreate,
  ESIMRead,
  ESIMUpdate,
  Esim,
  EsimCreateInput,
  EsimUpdateInput,
} from '../model'
import { buildQuery, omitUndefined, request } from '@/shared/api/request'

export type EsimResponse = ESIMRead

export type EsimListParams = {
  userId?: number
  offset?: number
  limit?: number
}

export function fromEsimResponse(esim: ESIMRead): Esim {
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

function toCreateRequest(input: EsimCreateInput): ESIMCreate {
  return omitUndefined({
    user_id: input.userId,
    account_id: input.accountId,
    imsi: input.imsi,
    name: input.name,
    isesim: input.isesim,
    createdate: input.createdate,
    token: input.token,
    networkstatus: input.networkstatus,
    balance: input.balance,
    use_account_for_charging: input.useAccountForCharging,
    smdpserver: input.smdpserver,
    activationcode: input.activationcode,
    imei: input.imei,
    imei_device: input.imeiDevice,
    allow_data: input.allowData,
  }) as ESIMCreate
}

function toUpdateRequest(input: EsimUpdateInput): ESIMUpdate {
  return omitUndefined({
    user_id: input.userId,
    account_id: input.accountId,
    imsi: input.imsi,
    name: input.name,
    isesim: input.isesim,
    createdate: input.createdate,
    token: input.token,
    networkstatus: input.networkstatus,
    balance: input.balance,
    use_account_for_charging: input.useAccountForCharging,
    smdpserver: input.smdpserver,
    activationcode: input.activationcode,
    imei: input.imei,
    imei_device: input.imeiDevice,
    allow_data: input.allowData,
  }) as ESIMUpdate
}

export async function listEsims(
  params: EsimListParams = {},
): Promise<Esim[]> {
  const esims = await request<ESIMRead[]>(
    `/esims${buildQuery({
      offset: params.offset,
      limit: params.limit,
      user_id: params.userId,
    })}`,
  )
  return esims.map(fromEsimResponse)
}

export async function getEsim(id: number): Promise<Esim> {
  const esim = await request<ESIMRead>(`/esims/${id}`)
  return fromEsimResponse(esim)
}

export async function createEsim(input: EsimCreateInput): Promise<Esim> {
  const esim = await request<ESIMRead>('/esims', {
    method: 'POST',
    body: JSON.stringify(toCreateRequest(input)),
  })

  return fromEsimResponse(esim)
}

export async function updateEsim(
  id: number,
  input: EsimUpdateInput,
): Promise<Esim> {
  const esim = await request<ESIMRead>(`/esims/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toUpdateRequest(input)),
  })

  return fromEsimResponse(esim)
}

export function deleteEsim(id: number): Promise<void> {
  return request<void>(`/esims/${id}`, {
    method: 'DELETE',
  })
}
