import { delay, http, HttpResponse } from 'msw'

import type { Esim, EsimCreateInput, EsimUpdateInput } from '../model'
import { mockEsims } from './data'
import { hasMockAccountId } from '@/features/accounts/mocks'
import { hasMockUserId } from '@/features/users/mocks'

const ESIMS_PATH = '*/esims'
const ESIM_PATH = '*/esims/:id'
const USER_ESIMS_PATH = '*/users/:id/esims'
const MOCK_DELAY_MS = 250

let esims: Esim[] = []

type EsimRequest = {
  user_id?: number
  account_id?: number
  imsi?: string
  name?: string
  isesim?: boolean
  createdate?: string
  token?: string
  networkstatus?: string
  balance?: number
  use_account_for_charging?: boolean
  smdpserver?: string
  activationcode?: string
  imei?: string
  imei_device?: string
  allow_data?: boolean
}

export function toEsimResponse(esim: Esim) {
  return {
    id: esim.id,
    user_id: esim.userId,
    account_id: esim.accountId,
    imsi: esim.imsi,
    name: esim.name,
    isesim: esim.isesim,
    createdate: esim.createdate,
    token: esim.token,
    networkstatus: esim.networkstatus,
    balance: esim.balance,
    use_account_for_charging: esim.useAccountForCharging,
    smdpserver: esim.smdpserver,
    activationcode: esim.activationcode,
    imei: esim.imei,
    imei_device: esim.imeiDevice,
    allow_data: esim.allowData,
  }
}

function fromInput(
  input: EsimCreateInput | EsimUpdateInput,
  fallback: Esim | null = null,
): Omit<Esim, 'id'> {
  return {
    userId: input.userId ?? fallback?.userId ?? null,
    accountId: input.accountId ?? fallback?.accountId ?? 3001,
    imsi: input.imsi ?? fallback?.imsi ?? '',
    name: input.name ?? fallback?.name ?? null,
    isesim: input.isesim ?? fallback?.isesim ?? null,
    createdate: input.createdate ?? fallback?.createdate ?? null,
    token: input.token ?? fallback?.token ?? null,
    networkstatus: input.networkstatus ?? fallback?.networkstatus ?? null,
    balance: input.balance ?? fallback?.balance ?? null,
    useAccountForCharging:
      input.useAccountForCharging ??
      fallback?.useAccountForCharging ??
      false,
    smdpserver: input.smdpserver ?? fallback?.smdpserver ?? null,
    activationcode: input.activationcode ?? fallback?.activationcode ?? null,
    imei: input.imei ?? fallback?.imei ?? null,
    imeiDevice: input.imeiDevice ?? fallback?.imeiDevice ?? null,
    allowData: input.allowData ?? fallback?.allowData ?? null,
  }
}

export function resetMockEsims() {
  esims = mockEsims.map((esim) => ({ ...esim }))
}

export function listMockEsimsForAccount(accountId: number) {
  return esims.filter((esim) => esim.accountId === accountId)
}

function parseEsimId(value: string | readonly string[] | undefined) {
  const id = Number(value)
  return Number.isInteger(id) ? id : null
}

async function readEsimInput(request: Request, requireBaseFields: boolean) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return {
      error: HttpResponse.json(
        { detail: 'A user and IMSI are required.' },
        { status: 400 },
      ),
    }
  }

  if (!body || typeof body !== 'object') {
    return {
      error: HttpResponse.json(
        { detail: 'A user and IMSI are required.' },
        { status: 400 },
      ),
    }
  }

  const candidate = body as Partial<EsimRequest>
  const userId = candidate.user_id
  const accountId = candidate.account_id
  const imsi = typeof candidate.imsi === 'string'
    ? candidate.imsi.trim()
    : undefined

  if (
    userId !== undefined &&
    (
      typeof userId !== 'number' ||
      !Number.isInteger(userId) ||
      userId <= 0
    )
  ) {
    return {
      error: HttpResponse.json(
        { detail: 'User must be a positive integer.' },
        { status: 422 },
      ),
    }
  }

  if (accountId !== undefined && !hasMockAccountId(accountId)) {
    return {
      error: HttpResponse.json(
        { detail: `Account '${accountId}' was not found` },
        { status: 404 },
      ),
    }
  }

  if (userId !== undefined && !hasMockUserId(userId)) {
    return {
      error: HttpResponse.json(
        { detail: `User '${userId}' was not found` },
        { status: 404 },
      ),
    }
  }

  if (
    accountId !== undefined &&
    (
      typeof accountId !== 'number' ||
      !Number.isInteger(accountId) ||
      accountId <= 0
    )
  ) {
    return {
      error: HttpResponse.json(
        { detail: 'Account must be a positive integer.' },
        { status: 422 },
      ),
    }
  }

  if (requireBaseFields && accountId === undefined) {
    return {
      error: HttpResponse.json(
        { detail: 'Account is required.' },
        { status: 422 },
      ),
    }
  }

  if (requireBaseFields && !imsi) {
    return {
      error: HttpResponse.json(
        { detail: 'IMSI is required.' },
        { status: 422 },
      ),
    }
  }

  if (imsi && !/^\d+$/.test(imsi)) {
    return {
      error: HttpResponse.json(
        { detail: 'IMSI must contain digits only.' },
        { status: 422 },
      ),
    }
  }

  return {
    input: {
      userId,
      accountId,
      imsi,
      name: candidate.name,
      isesim: candidate.isesim,
      createdate: candidate.createdate,
      token: candidate.token,
      networkstatus: candidate.networkstatus,
      balance: candidate.balance,
      useAccountForCharging: candidate.use_account_for_charging,
      smdpserver: candidate.smdpserver,
      activationcode: candidate.activationcode,
      imei: candidate.imei,
      imeiDevice: candidate.imei_device,
      allowData: candidate.allow_data,
    } satisfies EsimUpdateInput,
  }
}

function hasDuplicateImsi(imsi: string, ignoredEsimId?: number) {
  return esims.some(
    (esim) => esim.id !== ignoredEsimId && esim.imsi === imsi,
  )
}

resetMockEsims()

export const esimHandlers = [
  http.get(ESIMS_PATH, async ({ request }) => {
    await delay(MOCK_DELAY_MS)
    const url = new URL(request.url)
    const userId = Number(url.searchParams.get('user_id'))
    const offset = Number(url.searchParams.get('offset') ?? 0)
    const limit = Number(url.searchParams.get('limit') ?? 100)
    const filteredEsims = Number.isInteger(userId) && userId > 0
      ? esims.filter((esim) => esim.userId === userId)
      : esims

    return HttpResponse.json(
      filteredEsims.slice(offset, offset + limit).map(toEsimResponse),
    )
  }),

  http.post(ESIMS_PATH, async ({ request }) => {
    await delay(MOCK_DELAY_MS)
    const result = await readEsimInput(request, true)

    if ('error' in result) {
      return result.error
    }

    if (!result.input.imsi || result.input.accountId === undefined) {
      return HttpResponse.json(
        { detail: 'Account and IMSI are required.' },
        { status: 422 },
      )
    }

    if (hasDuplicateImsi(result.input.imsi)) {
      return HttpResponse.json(
        { detail: 'An eSIM with this IMSI already exists.' },
        { status: 409 },
      )
    }

    const esim: Esim = {
      ...fromInput(result.input as EsimCreateInput),
      id: Math.max(0, ...esims.map(({ id }) => id)) + 1,
    }

    esims.push(esim)
    return HttpResponse.json(toEsimResponse(esim), { status: 201 })
  }),

  http.get(USER_ESIMS_PATH, async ({ params, request }) => {
    await delay(MOCK_DELAY_MS)
    const id = parseEsimId(params.id)

    if (id === null || !hasMockUserId(id)) {
      return HttpResponse.json(
        { detail: 'User not found.' },
        { status: 404 },
      )
    }

    const url = new URL(request.url)
    const offset = Number(url.searchParams.get('offset') ?? 0)
    const limit = Number(url.searchParams.get('limit') ?? 100)

    return HttpResponse.json(
      esims
        .filter((esim) => esim.userId === id)
        .slice(offset, offset + limit)
        .map(toEsimResponse),
    )
  }),

  http.get(ESIM_PATH, async ({ params }) => {
    await delay(MOCK_DELAY_MS)
    const id = parseEsimId(params.id)
    const esim = id === null
      ? undefined
      : esims.find((candidate) => candidate.id === id)

    if (!esim) {
      return HttpResponse.json(
        { detail: 'eSIM not found.' },
        { status: 404 },
      )
    }

    return HttpResponse.json(toEsimResponse(esim))
  }),

  http.patch(ESIM_PATH, async ({ params, request }) => {
    await delay(MOCK_DELAY_MS)
    const id = parseEsimId(params.id)
    const result = await readEsimInput(request, false)

    if ('error' in result) {
      return result.error
    }

    const esimIndex = id === null
      ? -1
      : esims.findIndex((esim) => esim.id === id)

    if (esimIndex === -1 || id === null) {
      return HttpResponse.json(
        { detail: 'eSIM not found.' },
        { status: 404 },
      )
    }

    if (result.input.imsi && hasDuplicateImsi(result.input.imsi, id)) {
      return HttpResponse.json(
        { detail: 'An eSIM with this IMSI already exists.' },
        { status: 409 },
      )
    }

    const updatedEsim: Esim = {
      ...fromInput(result.input, esims[esimIndex]),
      id,
    }

    esims[esimIndex] = updatedEsim
    return HttpResponse.json(toEsimResponse(updatedEsim))
  }),

  http.delete(ESIM_PATH, async ({ params }) => {
    await delay(MOCK_DELAY_MS)
    const id = parseEsimId(params.id)
    const esimIndex = id === null
      ? -1
      : esims.findIndex((esim) => esim.id === id)

    if (esimIndex === -1) {
      return HttpResponse.json(
        { detail: 'eSIM not found.' },
        { status: 404 },
      )
    }

    esims.splice(esimIndex, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
