import { delay, http, HttpResponse } from 'msw'

import type { User, UserInput } from '../../types/user'
import { mockUsers } from '../data/users'

const USERS_PATH = '*/users'
const USER_PATH = '*/users/:id'
const MOCK_DELAY_MS = 250

let users: User[] = []

export function resetMockUsers() {
  users = mockUsers.map((user) => ({ ...user }))
}

export function hasMockUserId(id: number) {
  return users.some((user) => user.id === id)
}

function parseUserId(value: string | readonly string[] | undefined) {
  const id = Number(value)
  return Number.isInteger(id) ? id : null
}

function isUserInput(value: unknown): value is UserInput {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<UserInput>

  return [
    candidate.email,
    candidate.currency,
    candidate.language,
    candidate.timezone,
  ].every((field) => typeof field === 'string' && field.trim().length > 0)
}

async function readUserInput(request: Request) {
  try {
    const body: unknown = await request.json()
    return isUserInput(body) ? body : null
  } catch {
    return null
  }
}

function hasDuplicateEmail(email: string, ignoredUserId?: number) {
  const normalizedEmail = email.trim().toLowerCase()

  return users.some(
    (user) =>
      user.id !== ignoredUserId &&
      user.email.toLowerCase() === normalizedEmail,
  )
}

resetMockUsers()

export const userHandlers = [
  http.get(USERS_PATH, async () => {
    await delay(MOCK_DELAY_MS)
    return HttpResponse.json(users.map((user) => ({ ...user })))
  }),

  http.post(USERS_PATH, async ({ request }) => {
    await delay(MOCK_DELAY_MS)
    const input = await readUserInput(request)

    if (!input) {
      return HttpResponse.json(
        { detail: 'All user fields are required.' },
        { status: 400 },
      )
    }

    if (hasDuplicateEmail(input.email)) {
      return HttpResponse.json(
        { detail: 'A user with this email already exists.' },
        { status: 409 },
      )
    }

    const user: User = {
      ...input,
      email: input.email.trim(),
      id: Math.max(0, ...users.map(({ id }) => id)) + 1,
    }

    users.push(user)
    return HttpResponse.json({ ...user }, { status: 201 })
  }),

  http.patch(USER_PATH, async ({ params, request }) => {
    await delay(MOCK_DELAY_MS)
    const id = parseUserId(params.id)
    const input = await readUserInput(request)

    if (!input) {
      return HttpResponse.json(
        { detail: 'All user fields are required.' },
        { status: 400 },
      )
    }

    const userIndex = id === null
      ? -1
      : users.findIndex((user) => user.id === id)

    if (userIndex === -1 || id === null) {
      return HttpResponse.json(
        { detail: 'User not found.' },
        { status: 404 },
      )
    }

    if (hasDuplicateEmail(input.email, id)) {
      return HttpResponse.json(
        { detail: 'A user with this email already exists.' },
        { status: 409 },
      )
    }

    const updatedUser: User = {
      ...input,
      email: input.email.trim(),
      id,
    }

    users[userIndex] = updatedUser
    return HttpResponse.json({ ...updatedUser })
  }),

  http.delete(USER_PATH, async ({ params }) => {
    await delay(MOCK_DELAY_MS)
    const id = parseUserId(params.id)
    const userIndex = id === null
      ? -1
      : users.findIndex((user) => user.id === id)

    if (userIndex === -1) {
      return HttpResponse.json(
        { detail: 'User not found.' },
        { status: 404 },
      )
    }

    users.splice(userIndex, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
