export type StripeNotificationCreate = {
  eventid: string
  invoiceid: string
  customerid: string
  amount_net: string
  amount_tax: string
  amount_gross: string
  currency: string
  sku: string
  userid: number
  createdate: string
  taxrate?: string | null
  taxcountry?: string | null
  state?: string | null
  imsi?: string | null
  amount_credit?: string | null
}

export type StripeNotificationUpdate = Partial<StripeNotificationCreate>

export type StripeNotificationRead = {
  id: number
  eventid: string
  invoiceid: string
  customerid: string
  amount_net: string
  amount_tax: string
  amount_gross: string
  currency: string
  sku: string
  userid: number
  createdate: string
  taxrate: string | null
  taxcountry: string | null
  state: string | null
  imsi: string | null
  amount_credit: string | null
}

export type StripeNotification = StripeNotificationRead
