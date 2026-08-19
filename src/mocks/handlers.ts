import { esimHandlers } from './handlers/esims'
import { userHandlers } from './handlers/users'

export const handlers = [...userHandlers, ...esimHandlers]
