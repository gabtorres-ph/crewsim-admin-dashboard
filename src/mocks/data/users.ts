import type { User } from '../../types/user'

const defaultUserFields = {
  firstname: null,
  lastname: null,
  airline: null,
  position: null,
  referralcode: null,
  referredby: null,
  stripeid: null,
  logtoid: null,
  createdate: null,
  newsletter: null,
  smsnotification: null,
  rateus: null,
}

function user(
  input: Pick<User, 'id' | 'email' | 'language' | 'currency' | 'timezone'>,
): User {
  return {
    ...defaultUserFields,
    ...input,
  }
}

export const mockUsers = [
  user({
    id: 1001,
    email: 'alex.santos@example.com',
    language: 'en',
    currency: 'PHP',
    timezone: 'Asia/Manila',
  }),
  user({
    id: 1002,
    email: 'mei.lin@example.com',
    language: 'zh',
    currency: 'SGD',
    timezone: 'Asia/Singapore',
  }),
  user({
    id: 1003,
    email: 'haruto.tanaka@example.com',
    language: 'ja',
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
  }),
  user({
    id: 1004,
    email: 'sofia.martinez@example.com',
    language: 'es',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
  }),
  user({
    id: 1005,
    email: 'liam.oconnor@example.com',
    language: 'en',
    currency: 'EUR',
    timezone: 'Europe/Dublin',
  }),
  user({
    id: 1006,
    email: 'amelie.dubois@example.com',
    language: 'fr',
    currency: 'EUR',
    timezone: 'Europe/Paris',
  }),
  user({
    id: 1007,
    email: 'noah.williams@example.com',
    language: 'en',
    currency: 'USD',
    timezone: 'America/New_York',
  }),
  user({
    id: 1008,
    email: 'isabella.rossi@example.com',
    language: 'it',
    currency: 'EUR',
    timezone: 'Europe/Rome',
  }),
  user({
    id: 1009,
    email: 'lucas.schmidt@example.com',
    language: 'de',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
  }),
  user({
    id: 1010,
    email: 'ana.silva@example.com',
    language: 'pt',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
  }),
  user({
    id: 1011,
    email: 'oliver.brown@example.com',
    language: 'en',
    currency: 'GBP',
    timezone: 'Europe/London',
  }),
  user({
    id: 1012,
    email: 'min-jun.kim@example.com',
    language: 'ko',
    currency: 'KRW',
    timezone: 'Asia/Seoul',
  }),
  user({
    id: 1013,
    email: 'priya.sharma@example.com',
    language: 'hi',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  }),
  user({
    id: 1014,
    email: 'emma.johnson@example.com',
    language: 'en',
    currency: 'CAD',
    timezone: 'America/Toronto',
  }),
  user({
    id: 1015,
    email: 'ethan.nguyen@example.com',
    language: 'vi',
    currency: 'AUD',
    timezone: 'Australia/Sydney',
  }),
  user({
    id: 1016,
    email: 'fatima.al-hassan@example.com',
    language: 'ar',
    currency: 'AED',
    timezone: 'Asia/Dubai',
  }),
  user({
    id: 1017,
    email: 'lucas.muller+enterprise-account@example.com',
    language: 'de',
    currency: 'CHF',
    timezone: 'Europe/Zurich',
  }),
  user({
    id: 1018,
    email: 'ella.wilson@example.com',
    language: 'en',
    currency: 'NZD',
    timezone: 'Pacific/Auckland',
  }),
] satisfies readonly User[]
