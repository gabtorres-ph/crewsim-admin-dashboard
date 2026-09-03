import type { Esim } from '../model'

const defaultEsimFields = {
  name: null,
  isesim: null,
  createdate: null,
  token: null,
  networkstatus: null,
  balance: null,
  useAccountForCharging: false,
  smdpserver: null,
  activationcode: null,
  imei: null,
  imeiDevice: null,
  allowData: null,
}

function esim(input: Pick<Esim, 'id' | 'userId' | 'accountId' | 'imsi'>): Esim {
  return {
    ...defaultEsimFields,
    ...input,
  }
}

export const mockEsims = [
  esim({
    id: 2001,
    userId: 1001,
    accountId: 3001,
    imsi: '310150123456789',
  }),
  esim({
    id: 2002,
    userId: 1002,
    accountId: 3002,
    imsi: '525010987654321',
  }),
  esim({
    id: 2003,
    userId: 1003,
    accountId: 3003,
    imsi: '440100123456789',
  }),
  esim({
    id: 2004,
    userId: 1004,
    accountId: 3004,
    imsi: '214070987654321',
  }),
  esim({
    id: 2005,
    userId: 1007,
    accountId: 3007,
    imsi: '310260246813579',
  }),
  esim({
    id: 2006,
    userId: 1013,
    accountId: 3013,
    imsi: '404450135792468',
  }),
] satisfies readonly Esim[]
