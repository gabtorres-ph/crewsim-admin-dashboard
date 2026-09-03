import { accountHandlers } from './handlers/accounts'
import { esimHandlers } from './handlers/esims'
import { userHandlers } from '@/features/users/mocks'

export const handlers = [...accountHandlers, ...userHandlers, ...esimHandlers]
