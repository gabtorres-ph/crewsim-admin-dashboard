import { delay, http, HttpResponse } from 'msw'

import type { Esim, EsimInput } from '../../types/esims'
import { mockEsims } from '../data/esims'
import { hasMockUserId } from './users'

const ESIMS_PATH = '*/esims'
const ESIM_PATH = '*/esims/:id'
const MOCK_DELAY_MS = 250

let esims: Esim[] = []

type EsimRequest = {
  user_id: number
  imsi: string
}

function toResponse(esim: Esim) {
  return {
    id: esim.id,
    user_id: esim.userId,
    imsi: esim.imsi,
  }
}

export function resetMockEsims() {
  esims = mockEsims.map((esim) => ({ ...esim }))
}

function parseEsimId(value: string | readonly string[] | undefined) {
  const id = Number(value)
  return Number.isInteger(id) ? id : null
}

async function readEsimInput(request: Request) {
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
  const imsi = typeof candidate.imsi === 'string'
    ? candidate.imsi.trim()
    : ''

  if (
    typeof userId !== 'number' ||
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    return {
      error: HttpResponse.json(
        { detail: 'User is required.' },
        { status: 422 },
      ),
    }
  }

  if (!hasMockUserId(userId)) {
    return {
      error: HttpResponse.json(
        { detail: `User '${userId}' was not found` },
        { status: 404 },
      ),
    }
  }

  if (!imsi) {
    return {
      error: HttpResponse.json(
        { detail: 'IMSI is required.' },
        { status: 422 },
      ),
    }
  }

  if (!/^\d+$/.test(imsi)) {
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
      imsi,
    } satisfies EsimInput,
  }
}

function hasDuplicateImsi(imsi: string, ignoredEsimId?: number) {
  return esims.some(
    (esim) => esim.id !== ignoredEsimId && esim.imsi === imsi,
  )
}

resetMockEsims()

export const esimHandlers = [
  http.get(ESIMS_PATH, async () => {
    await delay(MOCK_DELAY_MS)
    return HttpResponse.json(esims.map(toResponse))
  }),

  http.post(ESIMS_PATH, async ({ request }) => {
    await delay(MOCK_DELAY_MS)
    const result = await readEsimInput(request)

    if ('error' in result) {
      return result.error
    }

    if (hasDuplicateImsi(result.input.imsi)) {
      return HttpResponse.json(
        { detail: 'An eSIM with this IMSI already exists.' },
        { status: 409 },
      )
    }

    const esim: Esim = {
      ...result.input,
      id: Math.max(0, ...esims.map(({ id }) => id)) + 1,
    }

    esims.push(esim)
    return HttpResponse.json(toResponse(esim), { status: 201 })
  }),

  http.patch(ESIM_PATH, async ({ params, request }) => {
    await delay(MOCK_DELAY_MS)
    const id = parseEsimId(params.id)
    const result = await readEsimInput(request)

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

    if (hasDuplicateImsi(result.input.imsi, id)) {
      return HttpResponse.json(
        { detail: 'An eSIM with this IMSI already exists.' },
        { status: 409 },
      )
    }

    const updatedEsim: Esim = {
      ...result.input,
      id,
    }

    esims[esimIndex] = updatedEsim
    return HttpResponse.json(toResponse(updatedEsim))
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
