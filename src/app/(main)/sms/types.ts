/** Data accepted by POST /api/sms. */
export type SmsCreate = {
  user_id: number;
  imsi: string;
  sender: string;
  sms_text: string;
  template?: string | null;
  language: string;
  created_at: string;
  sent_at?: string | null;
  sent_result_code?: string | null;
  sent_result_text?: string | null;
  retry_counter?: number | null;
};

/** Data required by PATCH /api/sms/{smsId}. */
export type SmsUpdate = {
  user_id: number;
  imsi: string;
  sender: string;
  sms_text: string;
  template: string | null;
  language: string;
  created_at: string;
  sent_at: string | null;
  sent_result_code: string | null;
  sent_result_text: string | null;
  retry_counter: number | null;
};

/** SMS representation returned by the API. */
export type SmsRead = SmsUpdate & { id: number };

export type SmsListParams = {
  offset?: number;
  limit?: number;
};
