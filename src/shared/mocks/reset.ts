import { resetMockAccounts } from '@/features/accounts/mocks'
import { resetMockCrew } from '@/features/crew/mocks'
import { resetMockEsims } from '@/features/esims/mocks'
import { resetMockFavorites } from '@/features/favorites/mocks'
import { resetMockPackages } from '@/features/packages/mocks'
import { resetMockSms } from '@/features/sms/mocks'
import { resetMockStripeNotifications } from '@/features/stripe/mocks'
import { resetMockUsage } from '@/features/usage/mocks'
import { resetMockUsers } from '@/features/users/mocks'
import { resetMockEmailWhitelist } from '@/features/whitelist/mocks'

export function resetAllMocks() {
  resetMockAccounts()
  resetMockUsers()
  resetMockEsims()
  resetMockFavorites()
  resetMockPackages()
  resetMockSms()
  resetMockUsage()
  resetMockCrew()
  resetMockEmailWhitelist()
  resetMockStripeNotifications()
}
