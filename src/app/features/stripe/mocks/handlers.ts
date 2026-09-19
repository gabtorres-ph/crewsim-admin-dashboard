import { HttpResponse } from 'msw'

import type {
  StripeNotificationCreate,
  StripeNotificationRead,
  StripeNotificationUpdate,
} from '../model'
import { createCrudHandlers } from '@/shared/mocks/crud'
import { hasMockUserId } from '@/features/users/mocks'
import { mockStripeNotifications } from './data'

let stripeNotifications: StripeNotificationRead[] = []

export function resetMockStripeNotifications() {
  stripeNotifications = mockStripeNotifications.map((record) => ({ ...record }))
}

function validateStripeNotification(
  input: StripeNotificationCreate | StripeNotificationUpdate,
) {
  if ('userid' in input && !hasMockUserId(Number(input.userid))) {
    return HttpResponse.json({ detail: 'User not found.' }, { status: 404 })
  }

  return null
}

resetMockStripeNotifications()

export const stripeNotificationHandlers = createCrudHandlers<
  StripeNotificationRead,
  StripeNotificationCreate,
  StripeNotificationUpdate
>({
  collectionPath: '*/stripe/notifications',
  itemPath: '*/stripe/notifications/:id',
  notFoundMessage: 'Stripe notification not found.',
  getItems: () => stripeNotifications,
  setItems: (items) => {
    stripeNotifications = items
  },
  defaultItem: (input) => ({
    ...input,
    taxrate: input.taxrate ?? null,
    taxcountry: input.taxcountry ?? null,
    state: input.state ?? null,
    imsi: input.imsi ?? null,
    amount_credit: input.amount_credit ?? null,
  }),
  validateCreate: validateStripeNotification,
  validateUpdate: validateStripeNotification,
})
