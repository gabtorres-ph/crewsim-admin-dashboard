import { accountHandlers } from './handlers/accounts'
import { esimHandlers } from './handlers/esims'
import { userHandlers } from './handlers/users'

export const handlers = [...accountHandlers, ...userHandlers, ...esimHandlers]
