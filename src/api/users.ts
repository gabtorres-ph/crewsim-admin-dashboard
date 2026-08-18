import type { User, UserInput } from '../types/user'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '')
  .replace(/\/+$/, '')

async function request<ResponseType>(
  path: string,
  options: RequestInit = {},
): Promise<ResponseType> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const body = await response.json()
      message =
        typeof body.detail === 'string'
          ? body.detail
          : JSON.stringify(body.detail)
    } catch {
      // Keep the status-based message when the response is not JSON.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as ResponseType
  }

  return response.json()
}

export function listUsers(): Promise<User[]> {
  return request<User[]>('/users')
}

export function createUser(input: UserInput): Promise<User> {
  return request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateUser(id: number, input: UserInput): Promise<User> {
  return request<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteUser(id: number): Promise<void> {
  return request<void>(`/users/${id}`, {
    method: 'DELETE',
  })
}
