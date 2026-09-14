import { accountHandlers } from '@/features/accounts/mocks'
import { crewHandlers } from '@/features/crew/mocks'
import { esimHandlers } from '@/features/esims/mocks'
import { favoriteHandlers } from '@/features/favorites/mocks'
import { packageHandlers } from '@/features/packages/mocks'
import { smsHandlers } from '@/features/sms/mocks'
import { stripeNotificationHandlers } from '@/features/stripe/mocks'
import { usageHandlers } from '@/features/usage/mocks'
import { userHandlers } from '@/features/users/mocks'
import { emailWhitelistHandlers } from '@/features/whitelist/mocks'

export const handlers = [
  ...accountHandlers,
  ...userHandlers,
  ...esimHandlers,
  ...favoriteHandlers,
  ...packageHandlers,
  ...smsHandlers,
  ...usageHandlers,
  ...crewHandlers,
  ...emailWhitelistHandlers,
  ...stripeNotificationHandlers,
]
