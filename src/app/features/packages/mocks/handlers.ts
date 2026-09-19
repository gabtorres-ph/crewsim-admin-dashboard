import { HttpResponse } from 'msw'

import type { PackageCreate, PackageRead, PackageUpdate } from '../model'
import { createCrudHandlers } from '@/shared/mocks/crud'
import { mockPackages } from './data'

let packages: PackageRead[] = []

export function resetMockPackages() {
  packages = mockPackages.map((packageRecord) => ({ ...packageRecord }))
}

function validatePackage(input: PackageCreate | PackageUpdate) {
  if (
    'sku' in input &&
    (typeof input.sku !== 'string' || input.sku.trim().length === 0)
  ) {
    return HttpResponse.json({ detail: 'SKU is required.' }, { status: 422 })
  }

  return null
}

resetMockPackages()

export const packageHandlers = createCrudHandlers<
  PackageRead,
  PackageCreate,
  PackageUpdate
>({
  collectionPath: '*/packages',
  itemPath: '*/packages/:id',
  notFoundMessage: 'Package not found.',
  getItems: () => packages,
  setItems: (items) => {
    packages = items
  },
  defaultItem: (input) => ({
    sku: input.sku.trim(),
    name: input.name ?? null,
    price: input.price ?? null,
    points: input.points ?? null,
    sparkid: input.sparkid ?? null,
    reward: input.reward ?? null,
  }),
  validateCreate: validatePackage,
  validateUpdate: validatePackage,
})
