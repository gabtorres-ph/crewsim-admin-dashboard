import { HttpResponse } from 'msw'

import type { SmsCreate, SmsRead, SmsUpdate } from '../model'
import { createCrudHandlers } from '@/shared/mocks/crud'
import { hasMockUserId } from '@/features/users/mocks'
import { mockSms } from './data'

let sms: SmsRead[] = []

export function resetMockSms() {
  sms = mockSms.map((message) => ({ ...message }))
}

function validateSms(input: SmsCreate | SmsUpdate) {
  if ('user_id' in input && !hasMockUserId(Number(input.user_id))) {
    return HttpResponse.json({ detail: 'User not found.' }, { status: 404 })
  }

  if ('language' in input && typeof input.language === 'string' && input.language.length !== 2) {
    return HttpResponse.json({ detail: 'Language must be two characters.' }, { status: 422 })
  }

  return null
}

resetMockSms()

export const smsHandlers = createCrudHandlers<SmsRead, SmsCreate, SmsUpdate>({
  collectionPath: '*/sms',
  itemPath: '*/sms/:id',
  notFoundMessage: 'SMS record not found.',
  getItems: () => sms,
  setItems: (items) => {
    sms = items
  },
  defaultItem: (input) => ({
    user_id: input.user_id,
    imsi: input.imsi,
    sender: input.sender,
    sms_text: input.sms_text,
    language: input.language,
    created_at: input.created_at,
    template: input.template ?? null,
    sent_at: input.sent_at ?? null,
    sent_result_code: input.sent_result_code ?? null,
    sent_result_text: input.sent_result_text ?? null,
    retry_counter: input.retry_counter ?? null,
  }),
  validateCreate: validateSms,
  validateUpdate: validateSms,
})
