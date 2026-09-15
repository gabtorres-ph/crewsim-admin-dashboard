import type { UsageCreate, UsageRead, UsageUpdate } from '../model'
import { createCrudHandlers } from '@/shared/mocks/crud'
import { mockUsage } from './data'

let usage: UsageRead[] = []

export function resetMockUsage() {
  usage = mockUsage.map((record) => ({ ...record }))
}

resetMockUsage()

export const usageHandlers = createCrudHandlers<
  UsageRead,
  UsageCreate,
  UsageUpdate
>({
  collectionPath: '*/usage',
  itemPath: '*/usage/:id',
  notFoundMessage: 'Usage record not found.',
  getItems: () => usage,
  setItems: (items) => {
    usage = items
  },
  defaultItem: (input) => ({
    ...input,
    dest_phone_number: input.dest_phone_number ?? null,
    custo_account_id: input.custo_account_id ?? null,
    custo_charge: input.custo_charge ?? null,
    subs_account_id: input.subs_account_id ?? null,
    subs_charge: input.subs_charge ?? null,
  }),
})
