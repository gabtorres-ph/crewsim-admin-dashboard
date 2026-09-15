import type { EmailWhitelistRead } from '../model'

export const mockEmailWhitelist = [
  {
    id: 9001,
    email: 'ops@example.com',
    status: 'active',
    createdate: '2026-09-01T06:00:00Z',
  },
  {
    id: 9002,
    email: 'crew-admin@example.com',
    status: 'pending',
    createdate: '2026-09-02T06:00:00Z',
  },
] satisfies readonly EmailWhitelistRead[]
