import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { mockAccounts } from '../mocks/data/accounts'
import { mockEsims } from '../mocks/data/esims'
import { mockUsers } from '../mocks/data/users'
import type { Account } from '../types/accounts'
import type { Esim, EsimTableRow } from '../types/esims'
import type { User } from '../types/user'
import { EsimTable } from './EsimTable'

const esims: Esim[] = mockEsims.slice(0, 3)
const users = mockUsers.slice(0, 3)
const accounts = mockAccounts.slice(0, 3)

function createRows(
  sourceEsims: Esim[],
  sourceUsers: readonly User[],
  sourceAccounts: readonly Account[],
): EsimTableRow[] {
  const usersById = new Map(sourceUsers.map((user) => [user.id, user]))
  const accountsById = new Map(
    sourceAccounts.map((account) => [account.id, account]),
  )

  return sourceEsims.map((esim) => {
    const accountName = accountsById.get(esim.accountId)?.name

    return {
      ...esim,
      esim,
      userLabel:
        esim.userId === null
          ? 'Unassigned'
          : usersById.get(esim.userId)?.email ?? `User #${esim.userId}`,
      accountLabel: accountName
        ? `${accountName} (ID: ${esim.accountId})`
        : `Account #${esim.accountId}`,
    }
  })
}

const meta = {
  title: 'Components/EsimTable',
  component: EsimTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-[#050914] p-5 md:p-10">
        <Story />
      </div>
    ),
  ],
  args: {
    rows: createRows(esims, users, accounts),
    hasSearch: false,
    sortKey: 'imsi',
    sortDirection: 'ascending',
    deletingId: null,
    onSort: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof EsimTable>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {}

export const Empty: Story = {
  args: {
    rows: [],
  },
}

export const FilteredEmpty: Story = {
  args: {
    rows: [],
    hasSearch: true,
  },
}

export const LongValues: Story = {
  args: {
    rows: createRows(
      [
        {
          ...mockEsims[0],
          id: 987654321012345,
          userId: 9999,
          accountId: 3999,
          imsi: '310150123456789012345678901234',
        },
      ],
      [
        {
          ...mockUsers[0],
          id: 9999,
          email: 'operations.team+international-roaming@example.com',
          language: 'en',
          currency: 'USD',
          timezone: 'UTC',
        },
      ],
      [],
    ),
  },
}

export const DescendingByUser: Story = {
  args: {
    sortKey: 'user',
    sortDirection: 'descending',
  },
}

export const DeletingRow: Story = {
  args: {
    deletingId: 2002,
  },
}
