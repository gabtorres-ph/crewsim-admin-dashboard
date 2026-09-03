import { fromEsimResponse, type EsimResponse } from '@/api/esims'
import { request } from '@/shared/api/request'
import type { Esim } from '@/types/esims'
import type { User, UserInput, UserUpdateInput } from '../model'

export type UserListParams = {
  offset?: number
  limit?: number
}

function buildQuery(params: UserListParams = {}) {
  const query = new URLSearchParams()

  if (params.offset !== undefined) {
    query.set('offset', String(params.offset))
  }

  if (params.limit !== undefined) {
    query.set('limit', String(params.limit))
  }

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

function toRequest<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter((entry) => {
      const value = entry[1]
      return value !== null && value !== undefined
    }),
  )
}

export function listUsers(params: UserListParams = {}): Promise<User[]> {
  return request<User[]>(`/users${buildQuery(params)}`)
}

export function getUser(id: number): Promise<User> {
  return request<User>(`/users/${id}`)
}

export function createUser(input: UserInput): Promise<User> {
  return request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(toRequest(input)),
  })
}

export function updateUser(id: number, input: UserUpdateInput): Promise<User> {
  return request<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toRequest(input)),
  })
}

export function deleteUser(id: number): Promise<void> {
  return request<void>(`/users/${id}`, {
    method: 'DELETE',
  })
}

export async function listUserEsims(
  userId: number,
  params: UserListParams = {},
): Promise<Esim[]> {
  const esims = await request<EsimResponse[]>(
    `/users/${userId}/esims${buildQuery(params)}`,
  )
  return esims.map(fromEsimResponse)
}
