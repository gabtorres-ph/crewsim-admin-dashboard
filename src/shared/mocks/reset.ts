import { resetMockAccounts } from '@/features/accounts/mocks'
import { resetMockEsims } from '@/features/esims/mocks'
import { resetMockUsers } from '@/features/users/mocks'

export function resetAllMocks() {
  resetMockAccounts()
  resetMockUsers()
  resetMockEsims()
}
