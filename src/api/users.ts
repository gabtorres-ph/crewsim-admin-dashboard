import type { User, UserInput } from '../types/user'
import { request } from './request'

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
