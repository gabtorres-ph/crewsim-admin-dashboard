import type { Esim } from '../../types/esims'

export const mockEsims = [
  {
    id: 2001,
    user: 'alex.santos@example.com',
    imsi: '310150123456789',
  },
  {
    id: 2002,
    user: 'mei.lin@example.com',
    imsi: '525010987654321',
  },
  {
    id: 2003,
    user: 'haruto.tanaka@example.com',
    imsi: '440100123456789',
  },
  {
    id: 2004,
    user: 'sofia.martinez@example.com',
    imsi: '214070987654321',
  },
  {
    id: 2005,
    user: 'noah.williams@example.com',
    imsi: '310260246813579',
  },
  {
    id: 2006,
    user: 'priya.sharma@example.com',
    imsi: '404450135792468',
  },
] satisfies readonly Esim[]
