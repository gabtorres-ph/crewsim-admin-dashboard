import type { Esim } from '../../types/esims'

export const mockEsims = [
  {
    id: 2001,
    userId: 1001,
    imsi: '310150123456789',
  },
  {
    id: 2002,
    userId: 1002,
    imsi: '525010987654321',
  },
  {
    id: 2003,
    userId: 1003,
    imsi: '440100123456789',
  },
  {
    id: 2004,
    userId: 1004,
    imsi: '214070987654321',
  },
  {
    id: 2005,
    userId: 1007,
    imsi: '310260246813579',
  },
  {
    id: 2006,
    userId: 1013,
    imsi: '404450135792468',
  },
] satisfies readonly Esim[]
