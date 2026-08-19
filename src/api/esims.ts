import type { Esim, EsimInput } from '../types/esims'
import { request } from './request'

export function listEsims(): Promise<Esim[]> {
  return request<Esim[]>('/esims')
}

export function createEsim(input: EsimInput): Promise<Esim> {
  return request<Esim>('/esims', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateEsim(
  id: number,
  input: EsimInput,
): Promise<Esim> {
  return request<Esim>(`/esims/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteEsim(id: number): Promise<void> {
  return request<void>(`/esims/${id}`, {
    method: 'DELETE',
  })
}
