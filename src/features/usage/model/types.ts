export type UsageCreate = {
  usage_date_utc: string
  session_id: string
  mcc: string
  mnc: string
  total_qty: number
  usage_type_id: number
  usage_type: string
  subs_reseller_name: string
  custo_account_name: string
  subs_account_name: string
  subscriber_id: string
  imsi: string
  iccid: string
  subs_phone_number: string
  prepaid_package_ids: string
  prepaid_package_qtys: string
  toll_free: string
  apn: string
  rat: string
  imei: string
  down_bitrate: number
  up_bitrate: number
  filename: string
  dest_phone_number?: string | null
  custo_account_id?: number | null
  custo_charge?: string | null
  subs_account_id?: number | null
  subs_charge?: string | null
}

export type UsageUpdate = Partial<UsageCreate>

export type UsageRead = {
  id: number
  usage_date_utc: string
  session_id: string
  mcc: string
  mnc: string
  total_qty: number
  usage_type_id: number
  usage_type: string
  subs_reseller_name: string
  custo_account_name: string
  subs_account_name: string
  subscriber_id: string
  imsi: string
  iccid: string
  subs_phone_number: string
  prepaid_package_ids: string
  prepaid_package_qtys: string
  toll_free: string
  apn: string
  rat: string
  imei: string
  down_bitrate: number
  up_bitrate: number
  filename: string
  dest_phone_number: string | null
  custo_account_id: number | null
  custo_charge: string | null
  subs_account_id: number | null
  subs_charge: string | null
}

export type Usage = UsageRead
