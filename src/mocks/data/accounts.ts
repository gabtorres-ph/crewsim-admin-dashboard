import type { Account } from '../../types/accounts'

export const mockAccounts = [
  { id: 3001, name: 'Pacific Operations', balance: 12450.75 },
  { id: 3002, name: 'Singapore Flight Crew', balance: 9800 },
  { id: 3003, name: 'Japan Cabin Services', balance: 7650.5 },
  { id: 3004, name: 'Iberia Regional', balance: 4120 },
  { id: 3007, name: 'North America Crew', balance: 18600.25 },
  { id: 3013, name: 'India Operations', balance: 5340.1 },
] satisfies readonly Account[]
