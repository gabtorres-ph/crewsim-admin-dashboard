import { delay, http, HttpResponse } from 'msw'

import type {
  Account,
  AccountCreateInput,
  AccountUpdateInput,
} from '../model'
import { mockAccounts } from './data'
import { listMockEsimsForAccount, toEsimResponse } from '@/mocks/handlers/esims'

const ACCOUNTS_PATH = '*/accounts'
const ACCOUNT_PATH = '*/accounts/:id'
const ACCOUNT_ESIMS_PATH = '*/accounts/:id/esims'
const MOCK_DELAY_MS = 250

let accounts: Account[] = []

export function resetMockAccounts() {
  accounts = mockAccounts.map((account) => ({ ...account }))
}

export function hasMockAccountId(id: number) {
  return accounts.some((account) => account.id === id)
}

function parseAccountId(value: string | readonly string[] | undefined) {
  const id = Number(value)
  return Number.isInteger(id) ? id : null
}

function isValidName(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 255
}

function isValidBalance(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

async function readAccountInput(
  request: Request,
  requireAllFields: boolean,
): Promise<AccountCreateInput | AccountUpdateInput | null> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return null
  }

  if (!body || typeof body !== 'object') {
    return null
  }

  const candidate = body as Partial<AccountCreateInput>
  const name = candidate.name
  const balance = candidate.balance
  const hasName = name !== undefined
  const hasBalance = balance !== undefined

  if (
    (requireAllFields && (!hasName || !hasBalance)) ||
    (hasName && !isValidName(name)) ||
    (hasBalance && !isValidBalance(balance))
  ) {
    return null
  }

  const input: AccountUpdateInput = {}

  if (isValidName(name)) {
    input.name = name.trim()
  }

  if (isValidBalance(balance)) {
    input.balance = balance
  }

  return input
}

function validationError() {
  return HttpResponse.json(
    { detail: 'Name must be 1–255 characters and balance must be a finite number.' },
    { status: 422 },
  )
}

resetMockAccounts()

export const accountHandlers = [
  http.get(ACCOUNTS_PATH, async ({ request }) => {
    await delay(MOCK_DELAY_MS)
    const url = new URL(request.url)
    const offset = Number(url.searchParams.get('offset') ?? 0)
    const limit = Number(url.searchParams.get('limit') ?? 100)

    return HttpResponse.json(
      accounts.slice(offset, offset + limit).map((account) => ({ ...account })),
    )
  }),

  http.get(ACCOUNT_ESIMS_PATH, async ({ params, request }) => {
    await delay(MOCK_DELAY_MS)
    const id = parseAccountId(params.id)

    if (id === null || !hasMockAccountId(id)) {
      return HttpResponse.json({ detail: 'Account not found.' }, { status: 404 })
    }

    const url = new URL(request.url)
    const offset = Number(url.searchParams.get('offset') ?? 0)
    const limit = Number(url.searchParams.get('limit') ?? 100)

    return HttpResponse.json(
      listMockEsimsForAccount(id)
        .slice(offset, offset + limit)
        .map(toEsimResponse),
    )
  }),

  http.get(ACCOUNT_PATH, async ({ params }) => {
    await delay(MOCK_DELAY_MS)
    const id = parseAccountId(params.id)
    const account = id === null
      ? undefined
      : accounts.find((candidate) => candidate.id === id)

    if (!account) {
      return HttpResponse.json({ detail: 'Account not found.' }, { status: 404 })
    }

    return HttpResponse.json({ ...account })
  }),

  http.post(ACCOUNTS_PATH, async ({ request }) => {
    await delay(MOCK_DELAY_MS)
    const input = await readAccountInput(request, true)

    if (!input || input.name === undefined || input.balance === undefined) {
      return validationError()
    }

    const account: Account = {
      id: Math.max(0, ...accounts.map(({ id }) => id)) + 1,
      name: input.name,
      balance: input.balance,
    }

    accounts.push(account)
    return HttpResponse.json({ ...account }, { status: 201 })
  }),

  http.patch(ACCOUNT_PATH, async ({ params, request }) => {
    await delay(MOCK_DELAY_MS)
    const id = parseAccountId(params.id)
    const accountIndex = id === null
      ? -1
      : accounts.findIndex((account) => account.id === id)

    if (accountIndex === -1 || id === null) {
      return HttpResponse.json({ detail: 'Account not found.' }, { status: 404 })
    }

    const input = await readAccountInput(request, false)

    if (!input) {
      return validationError()
    }

    const updatedAccount: Account = {
      ...accounts[accountIndex],
      ...input,
      id,
    }

    accounts[accountIndex] = updatedAccount
    return HttpResponse.json({ ...updatedAccount })
  }),

  http.delete(ACCOUNT_PATH, async ({ params }) => {
    await delay(MOCK_DELAY_MS)
    const id = parseAccountId(params.id)
    const accountIndex = id === null
      ? -1
      : accounts.findIndex((account) => account.id === id)

    if (accountIndex === -1 || id === null) {
      return HttpResponse.json({ detail: 'Account not found.' }, { status: 404 })
    }

    if (listMockEsimsForAccount(id).length > 0) {
      return HttpResponse.json(
        { detail: 'The account cannot be deleted while it is referenced by other data.' },
        { status: 409 },
      )
    }

    accounts.splice(accountIndex, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
