import { HttpResponse } from 'msw'

import type {
  EmailWhitelistCreate,
  EmailWhitelistRead,
  EmailWhitelistUpdate,
} from '../model'
import { createCrudHandlers } from '@/shared/mocks/crud'
import { mockEmailWhitelist } from './data'

let emailWhitelist: EmailWhitelistRead[] = []

export function resetMockEmailWhitelist() {
  emailWhitelist = mockEmailWhitelist.map((record) => ({ ...record }))
}

function validateEmailWhitelist(
  input: EmailWhitelistCreate | EmailWhitelistUpdate,
) {
  if (
    ('email' in input &&
      (typeof input.email !== 'string' || input.email.trim().length === 0)) ||
    ('status' in input &&
      (typeof input.status !== 'string' || input.status.trim().length === 0))
  ) {
    return HttpResponse.json({ detail: 'Email and status are required.' }, { status: 422 })
  }

  return null
}

resetMockEmailWhitelist()

export const emailWhitelistHandlers = createCrudHandlers<
  EmailWhitelistRead,
  EmailWhitelistCreate,
  EmailWhitelistUpdate
>({
  collectionPath: '*/email-whitelist',
  itemPath: '*/email-whitelist/:id',
  notFoundMessage: 'Email whitelist record not found.',
  getItems: () => emailWhitelist,
  setItems: (items) => {
    emailWhitelist = items
  },
  defaultItem: (input) => ({
    email: input.email.trim(),
    status: input.status.trim(),
    createdate: new Date().toISOString(),
  }),
  validateCreate: validateEmailWhitelist,
  validateUpdate: validateEmailWhitelist,
})
