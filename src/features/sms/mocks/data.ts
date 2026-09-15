import type { SmsRead } from '../model'

export const mockSms = [
  {
    id: 6001,
    user_id: 1001,
    imsi: '310150123456789',
    sender: 'CrewSIM',
    sms_text: 'Your CrewSIM profile is ready.',
    language: 'en',
    created_at: '2026-09-01T08:30:00Z',
    template: 'activation_ready',
    sent_at: '2026-09-01T08:31:00Z',
    sent_result_code: '200',
    sent_result_text: 'accepted',
    retry_counter: 0,
  },
  {
    id: 6002,
    user_id: 1002,
    imsi: '525010987654321',
    sender: 'CrewSIM',
    sms_text: 'Your package has been updated.',
    language: 'en',
    created_at: '2026-09-02T10:00:00Z',
    template: null,
    sent_at: null,
    sent_result_code: null,
    sent_result_text: null,
    retry_counter: null,
  },
] satisfies readonly SmsRead[]
