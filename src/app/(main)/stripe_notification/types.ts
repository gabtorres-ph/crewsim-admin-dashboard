/** A lossless decimal representation sent to and returned by the API. */
export type DecimalString = string;

/** Data accepted by POST /api/stripe_notification. */
export type StripeNotificationCreate = {
  eventid: string;
  invoiceid: string;
  customerid: string;
  taxrate?: DecimalString | null;
  taxcountry?: string | null;
  amount_net: DecimalString;
  amount_tax: DecimalString;
  amount_gross: DecimalString;
  currency: string;
  sku: string;
  userid: number;
  state?: string | null;
  createdate: string;
  imsi?: string | null;
  amount_credit?: DecimalString | null;
};

/** Data required by PATCH /api/stripe_notification/{notificationId}. */
export type StripeNotificationUpdate = {
  eventid: string;
  invoiceid: string;
  customerid: string;
  taxrate: DecimalString | null;
  taxcountry: string | null;
  amount_net: DecimalString;
  amount_tax: DecimalString;
  amount_gross: DecimalString;
  currency: string;
  sku: string;
  userid: number;
  state: string | null;
  createdate: string;
  imsi: string | null;
  amount_credit: DecimalString | null;
};

/** Stripe notification representation returned by the API. */
export type StripeNotificationRead = StripeNotificationUpdate & { id: number };

export type StripeNotificationListParams = {
  offset?: number;
  limit?: number;
};
