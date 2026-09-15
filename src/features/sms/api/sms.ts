import {
  buildQuery,
  omitUndefined,
  type ListParams,
  request,
} from '@/shared/api/request'
import type { SmsCreate, SmsRead, SmsUpdate } from '../model'

export function listSms(params: ListParams = {}): Promise<SmsRead[]> {
  return request<SmsRead[]>(`/sms${buildQuery(params)}`)
}

export function getSms(id: number): Promise<SmsRead> {
  return request<SmsRead>(`/sms/${id}`)
}

export function createSms(input: SmsCreate): Promise<SmsRead> {
  return request<SmsRead>('/sms', {
    method: 'POST',
    body: JSON.stringify(omitUndefined(input)),
  })
}

export function updateSms(id: number, input: SmsUpdate): Promise<SmsRead> {
  return request<SmsRead>(`/sms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(omitUndefined(input)),
  })
}

export function deleteSms(id: number): Promise<void> {
  return request<void>(`/sms/${id}`, {
    method: 'DELETE',
  })
}
