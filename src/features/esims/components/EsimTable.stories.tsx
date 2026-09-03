import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { mockAccounts } from '@/features/accounts/mocks'
import { mockEsims } from '../mocks'
import { mockUsers } from '@/features/users/mocks'
import type { Account } from '@/features/accounts/model'
import type { Esim, EsimTableRow } from '../model'
import type { User } from '@/features/users/model'
import { EsimTable } from './EsimTable'

const esims: Esim[] = [
  {
    ...mockEsims[0],
    networkstatus: 'Active',
    balance: 1250,
    smdpserver: 'smdp.example.com',
    activationcode: 'ACT-2001',
    imei: '357881234567890',
    imeiDevice: 'Cabin tablet',
  },
  {
    ...mockEsims[1],
    networkstatus: 'Suspended',
    balance: 0,
  },
  {
    ...mockEsims[2],
    networkstatus: null,
    name: 'Operations backup',
  },
]
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

const fallbackEsims: Esim[] = [
  {
    ...mockEsims[0],
    id: 3101,
    userId: 1001,
    accountId: 3001,
    imsi: '310150000000001',
  },
  {
    ...mockEsims[1],
    id: 3102,
    userId: null,
    accountId: 3001,
    imsi: '310150000000002',
  },
  {
    ...mockEsims[2],
    id: 3103,
    userId: 9999,
    accountId: 3999,
    imsi: '310150000000003',
  },
]

const fallbackRows = createRows(
  fallbackEsims,
  [{ ...mockUsers[0], email: 'zulu.crew@example.com' }],
  [{ ...mockAccounts[0], name: 'Zulu Account' }],
)

const paginatedEsims: Esim[] = Array.from({ length: 11 }, (_, index) => ({
  ...mockEsims[0],
  id: 4001 + index,
  userId: null,
  imsi: `310150${String(index + 1).padStart(9, '0')}`,
  networkstatus: 'Active',
}))

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
    deletingId: null,
    onEdit: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof EsimTable>

export default meta
type Story = StoryObj<typeof meta>

export const Populated: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bodyRows = canvas.getAllByRole('row').slice(1)

    await expect(
      canvas.getByRole('columnheader', { name: 'IMSI' }),
    ).toHaveAttribute('aria-sort', 'ascending')
    await expect(bodyRows[0]).toHaveTextContent('310150123456789')
    await expect(bodyRows[1]).toHaveTextContent('440100123456789')
    await expect(bodyRows[2]).toHaveTextContent('525010987654321')
  },
}

export const Empty: Story = {
  args: {
    rows: [],
  },
}

export const FilteredEmpty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search eSIMs' }),
      'does-not-exist',
    )

    await expect(
      canvas.getByText('No eSIMs match your search.'),
    ).toBeVisible()
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const userHeaderButton = canvas.getByRole('button', { name: 'User' })

    await userEvent.click(userHeaderButton)
    await userEvent.click(userHeaderButton)

    await expect(
      canvas.getByRole('columnheader', { name: 'User' }),
    ).toHaveAttribute('aria-sort', 'descending')
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent(
      'mei.lin@example.com',
    )
  },
}

export const AscendingByAccount: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: 'Account' }))

    await expect(
      canvas.getByRole('columnheader', { name: 'Account' }),
    ).toHaveAttribute('aria-sort', 'ascending')
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent(
      'Japan Cabin Services (ID: 3003)',
    )
  },
}

export const RelationshipFallbackSorting: Story = {
  args: {
    rows: fallbackRows,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: 'User' }))

    const rowsByUser = canvas.getAllByRole('row').slice(1)
    await expect(rowsByUser[0]).toHaveTextContent('Unassigned')
    await expect(rowsByUser[1]).toHaveTextContent('User #9999')
    await expect(rowsByUser[2]).toHaveTextContent('zulu.crew@example.com')

    await userEvent.click(canvas.getByRole('button', { name: 'Account' }))

    const rowsByAccount = canvas.getAllByRole('row').slice(1)
    await expect(rowsByAccount[0]).toHaveTextContent('Account #3999')
    await expect(rowsByAccount[1]).toHaveTextContent('Zulu Account (ID: 3001)')
  },
}

export const DeletingRow: Story = {
  args: {
    deletingId: 2002,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const deletingImsi = '525010987654321'

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: 'Status' }),
      'Suspended',
    )

    await expect(
      canvas.getByRole('button', { name: `Edit eSIM ${deletingImsi}` }),
    ).toBeDisabled()
    await expect(
      canvas.getByRole('button', { name: `Delete eSIM ${deletingImsi}` }),
    ).toHaveTextContent('Deleting')

    for (const deleteButton of canvas.getAllByRole('button', {
      name: /Delete eSIM/,
    })) {
      await expect(deleteButton).toBeDisabled()
    }
  },
}

export const ActionsUseOriginalRecord: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: 'Status' }),
      'Active',
    )

    await userEvent.click(
      canvas.getByRole('button', { name: `Edit eSIM ${esims[0].imsi}` }),
    )

    await userEvent.click(
      canvas.getByRole('button', { name: `Delete eSIM ${esims[0].imsi}` }),
    )

    await expect(args.onEdit).toHaveBeenCalledWith(esims[0])
    await expect(args.onDelete).toHaveBeenCalledWith(esims[0])
  },
}

export const ActionsAfterPagination: Story = {
  args: {
    rows: createRows(paginatedEsims, [], []),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const lastEsim = paginatedEsims.at(-1)!

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }))
    await expect(canvas.getByText('Page 2 of 2')).toBeVisible()
    const editButton = canvas.getByRole('button', {
      name: `Edit eSIM ${lastEsim.imsi}`,
    })
    editButton.focus()
    await expect(editButton).toHaveFocus()
    await userEvent.keyboard('{Enter}')

    await expect(args.onEdit).toHaveBeenCalledWith(lastEsim)
  },
}

export const SearchByHiddenMetadata: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search eSIMs' }),
      'Cabin tablet',
    )

    await expect(canvas.getByText('310150123456789')).toBeVisible()
    await expect(canvas.getByText('1 result')).toBeVisible()
  },
}

export const UnspecifiedStatus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: 'Status' }),
      canvas.getByRole('option', { name: 'Unspecified' }),
    )

    await expect(canvas.getByText('440100123456789')).toBeVisible()
    await expect(canvas.getByText('1 result')).toBeVisible()
  },
}
