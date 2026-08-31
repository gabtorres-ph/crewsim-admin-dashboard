import { fromEsimResponse, type EsimResponse } from './esims'
import { request } from './request'
import type { Esim } from '../types/esims'
import type {
  Account,
  AccountCreateInput,
  AccountUpdateInput,
} from '../types/accounts'

export type AccountListParams = {
  offset?: number
  limit?: number
}

function buildQuery(params: AccountListParams = {}) {
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

export function listAccounts(
  params: AccountListParams = {},
): Promise<Account[]> {
  return request<Account[]>(`/accounts${buildQuery(params)}`)
}

export function getAccount(id: number): Promise<Account> {
  return request<Account>(`/accounts/${id}`)
}

export function createAccount(input: AccountCreateInput): Promise<Account> {
  return request<Account>('/accounts', {
    method: 'POST',
    body: JSON.stringify(toRequest(input)),
  })
}

export function updateAccount(
  id: number,
  input: AccountUpdateInput,
): Promise<Account> {
  return request<Account>(`/accounts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toRequest(input)),
  })
}

export function deleteAccount(id: number): Promise<void> {
  return request<void>(`/accounts/${id}`, {
    method: 'DELETE',
  })
}

export async function listAccountEsims(
  accountId: number,
  params: AccountListParams = {},
): Promise<Esim[]> {
  const esims = await request<EsimResponse[]>(
    `/accounts/${accountId}/esims${buildQuery(params)}`,
  )

  return esims.map(fromEsimResponse)
}
