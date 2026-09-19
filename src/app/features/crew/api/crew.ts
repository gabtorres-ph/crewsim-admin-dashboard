import {
  buildQuery,
  omitUndefined,
  type ListParams,
  request,
} from '@/shared/api/request'
import type { CrewCreate, CrewRead, CrewUpdate } from '../model'

export function listCrew(params: ListParams = {}): Promise<CrewRead[]> {
  return request<CrewRead[]>(`/crew${buildQuery(params)}`)
}

export function getCrew(id: number): Promise<CrewRead> {
  return request<CrewRead>(`/crew/${id}`)
}

export function createCrew(input: CrewCreate): Promise<CrewRead> {
  return request<CrewRead>('/crew', {
    method: 'POST',
    body: JSON.stringify(omitUndefined(input)),
  })
}

export function updateCrew(id: number, input: CrewUpdate): Promise<CrewRead> {
  return request<CrewRead>(`/crew/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(omitUndefined(input)),
  })
}

export function deleteCrew(id: number): Promise<void> {
  return request<void>(`/crew/${id}`, {
    method: 'DELETE',
  })
}
