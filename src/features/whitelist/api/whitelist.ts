import {
  buildQuery,
  omitUndefined,
  type ListParams,
  request,
} from '@/shared/api/request'
import type {
  EmailWhitelistCreate,
  EmailWhitelistRead,
  EmailWhitelistUpdate,
} from '../model'

export function listEmailWhitelist(
  params: ListParams = {},
): Promise<EmailWhitelistRead[]> {
  return request<EmailWhitelistRead[]>(`/email-whitelist${buildQuery(params)}`)
}

export function getEmailWhitelist(id: number): Promise<EmailWhitelistRead> {
  return request<EmailWhitelistRead>(`/email-whitelist/${id}`)
}

export function createEmailWhitelist(
  input: EmailWhitelistCreate,
): Promise<EmailWhitelistRead> {
  return request<EmailWhitelistRead>('/email-whitelist', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateEmailWhitelist(
  id: number,
  input: EmailWhitelistUpdate,
): Promise<EmailWhitelistRead> {
  return request<EmailWhitelistRead>(`/email-whitelist/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(omitUndefined(input)),
  })
}

export function deleteEmailWhitelist(id: number): Promise<void> {
  return request<void>(`/email-whitelist/${id}`, {
    method: 'DELETE',
  })
}
