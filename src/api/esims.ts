import type { Esim, EsimInput } from '../types/esims'
import { request } from './request'

type EsimResponse = {
  id: number
  user_id: number
  imsi: string
}

type EsimRequest = {
  user_id: number
  imsi: string
}

function fromResponse(esim: EsimResponse): Esim {
  return {
    id: esim.id,
    userId: esim.user_id,
    imsi: esim.imsi,
  }
}

function toRequest(input: EsimInput): EsimRequest {
  return {
    user_id: input.userId,
    imsi: input.imsi,
  }
}

export async function listEsims(): Promise<Esim[]> {
  const esims = await request<EsimResponse[]>('/esims')
  return esims.map(fromResponse)
}

export async function createEsim(input: EsimInput): Promise<Esim> {
  const esim = await request<EsimResponse>('/esims', {
    method: 'POST',
    body: JSON.stringify(toRequest(input)),
  })

  return fromResponse(esim)
}

export async function updateEsim(
  id: number,
  input: EsimInput,
): Promise<Esim> {
  const esim = await request<EsimResponse>(`/esims/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toRequest(input)),
  })

  return fromResponse(esim)
}

export function deleteEsim(id: number): Promise<void> {
  return request<void>(`/esims/${id}`, {
    method: 'DELETE',
  })
}
