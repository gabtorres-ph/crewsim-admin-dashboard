import {
  buildQuery,
  omitUndefined,
  type ListParams,
  request,
} from '@/shared/api/request'
import type {
  StripeNotificationCreate,
  StripeNotificationRead,
  StripeNotificationUpdate,
} from '../model'

const STRIPE_NOTIFICATIONS_PATH = '/stripe/notifications'

export function listStripeNotifications(
  params: ListParams = {},
): Promise<StripeNotificationRead[]> {
  return request<StripeNotificationRead[]>(
    `${STRIPE_NOTIFICATIONS_PATH}${buildQuery(params)}`,
  )
}

export function getStripeNotification(
  id: number,
): Promise<StripeNotificationRead> {
  return request<StripeNotificationRead>(`${STRIPE_NOTIFICATIONS_PATH}/${id}`)
}

export function createStripeNotification(
  input: StripeNotificationCreate,
): Promise<StripeNotificationRead> {
  return request<StripeNotificationRead>(STRIPE_NOTIFICATIONS_PATH, {
    method: 'POST',
    body: JSON.stringify(omitUndefined(input)),
  })
}

export function updateStripeNotification(
  id: number,
  input: StripeNotificationUpdate,
): Promise<StripeNotificationRead> {
  return request<StripeNotificationRead>(`${STRIPE_NOTIFICATIONS_PATH}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(omitUndefined(input)),
  })
}

export function deleteStripeNotification(id: number): Promise<void> {
  return request<void>(`${STRIPE_NOTIFICATIONS_PATH}/${id}`, {
    method: 'DELETE',
  })
}
