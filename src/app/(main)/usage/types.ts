/** Decimal values are strings because the API serializes them losslessly. */
export type DecimalString = string;

/** Data required by POST /api/usage. */
export type UsageCreate = {
  usage_date_utc: string;
  session_id: string;
  mcc: number;
  mnc: number;
  total_qty: number;
  usage_type_id: number;
  usage_type: string;
  dest_phone_number: string | null;
  subs_reseller_name: string;
  custo_account_name: string;
  subs_account_name: string;
  subscriber_id: number;
  imsi: string;
  iccid: string;
  subs_phone_number: string;
  prepaid_package_ids: string;
  prepaid_package_qtys: string;
  toll_free: string;
  custo_account_id: number | null;
  custo_charge: DecimalString | null;
  subs_account_id: number | null;
  subs_charge: DecimalString | null;
  apn: string;
  rat: number;
  imei: string;
  down_bitrate: number;
  up_bitrate: number;
  filename: string;
};

/** Data accepted by PATCH /api/usage/{usageId}. */
export type UsageUpdate = Partial<UsageCreate>;

/** Usage representation returned by the API. */
export type UsageRead = UsageCreate & {
  id: number;
};

export type UsageListParams = {
  offset?: number;
  limit?: number;
};
