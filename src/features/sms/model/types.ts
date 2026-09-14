export type SmsCreate = {
  user_id: number
  imsi: string
  sender: string
  sms_text: string
  language: string
  created_at: string
  template?: string | null
  sent_at?: string | null
  sent_result_code?: string | null
  sent_result_text?: string | null
  retry_counter?: number | null
}

export type SmsUpdate = Partial<SmsCreate>

export type SmsRead = {
  id: number
  user_id: number
  imsi: string
  sender: string
  sms_text: string
  language: string
  created_at: string
  template: string | null
  sent_at: string | null
  sent_result_code: string | null
  sent_result_text: string | null
  retry_counter: number | null
}

export type Sms = SmsRead
