import { HttpResponse } from 'msw'

import type { CrewCreate, CrewRead, CrewUpdate } from '../model'
import { createCrudHandlers } from '@/shared/mocks/crud'
import { hasMockUserId } from '@/features/users/mocks'
import { mockCrew } from './data'

let crew: CrewRead[] = []

export function resetMockCrew() {
  crew = mockCrew.map((record) => ({ ...record }))
}

function validateCrew(input: CrewCreate | CrewUpdate) {
  if (
    'user_id' in input &&
    input.user_id !== null &&
    input.user_id !== undefined &&
    !hasMockUserId(input.user_id)
  ) {
    return HttpResponse.json({ detail: 'User not found.' }, { status: 404 })
  }

  return null
}

resetMockCrew()

export const crewHandlers = createCrudHandlers<CrewRead, CrewCreate, CrewUpdate>({
  collectionPath: '*/crew',
  itemPath: '*/crew/:id',
  notFoundMessage: 'Crew record not found.',
  getItems: () => crew,
  setItems: (items) => {
    crew = items
  },
  defaultItem: (input) => ({
    ...input,
    file1: input.file1 ?? null,
    file2: input.file2 ?? null,
    firstname: input.firstname ?? null,
    lastname: input.lastname ?? null,
    airline: input.airline ?? null,
    user_id: input.user_id ?? null,
    file1_hash: input.file1_hash ?? null,
    file2_hash: input.file2_hash ?? null,
    reason: input.reason ?? null,
    confidence: input.confidence ?? null,
    type: input.type ?? null,
    dhash: input.dhash ?? null,
    phash: input.phash ?? null,
    dhash_distance: input.dhash_distance ?? null,
    phash_distance: input.phash_distance ?? null,
  }),
  validateCreate: validateCrew,
  validateUpdate: validateCrew,
})
