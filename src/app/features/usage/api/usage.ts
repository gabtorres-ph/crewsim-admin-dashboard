import {
  buildQuery,
  omitUndefined,
  type ListParams,
  request,
} from '@/shared/api/request'
import type { UsageCreate, UsageRead, UsageUpdate } from '../model'

export function listUsage(params: ListParams = {}): Promise<UsageRead[]> {
  return request<UsageRead[]>(`/usage${buildQuery(params)}`)
}

export function getUsage(id: number): Promise<UsageRead> {
  return request<UsageRead>(`/usage/${id}`)
}

export function createUsage(input: UsageCreate): Promise<UsageRead> {
  return request<UsageRead>('/usage', {
    method: 'POST',
    body: JSON.stringify(omitUndefined(input)),
  })
}

export function updateUsage(
  id: number,
  input: UsageUpdate,
): Promise<UsageRead> {
  return request<UsageRead>(`/usage/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(omitUndefined(input)),
  })
}

export function deleteUsage(id: number): Promise<void> {
  return request<void>(`/usage/${id}`, {
    method: 'DELETE',
  })
}
