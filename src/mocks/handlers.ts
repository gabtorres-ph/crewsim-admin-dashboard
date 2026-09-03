import { accountHandlers } from '@/features/accounts/mocks'
import { esimHandlers } from '@/features/esims/mocks'
import { userHandlers } from '@/features/users/mocks'

export const handlers = [...accountHandlers, ...userHandlers, ...esimHandlers]
