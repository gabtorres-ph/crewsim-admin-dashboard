import {
  buildQuery,
  omitUndefined,
  type ListParams,
  request,
} from '@/shared/api/request'
import type { PackageCreate, PackageRead, PackageUpdate } from '../model'

export function listPackages(params: ListParams = {}): Promise<PackageRead[]> {
  return request<PackageRead[]>(`/packages${buildQuery(params)}`)
}

export function getPackage(id: number): Promise<PackageRead> {
  return request<PackageRead>(`/packages/${id}`)
}

export function createPackage(input: PackageCreate): Promise<PackageRead> {
  return request<PackageRead>('/packages', {
    method: 'POST',
    body: JSON.stringify(omitUndefined(input)),
  })
}

export function updatePackage(
  id: number,
  input: PackageUpdate,
): Promise<PackageRead> {
  return request<PackageRead>(`/packages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(omitUndefined(input)),
  })
}

export function deletePackage(id: number): Promise<void> {
  return request<void>(`/packages/${id}`, {
    method: 'DELETE',
  })
}
