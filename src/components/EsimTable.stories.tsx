import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { mockEsims } from '../mocks/data/esims'
import { mockUsers } from '../mocks/data/users'
import type { Esim } from '../types/esims'
import { EsimTable } from './EsimTable'

const esims: Esim[] = mockEsims.slice(0, 3)

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
    esims,
    users: mockUsers.slice(0, 3),
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
    esims: [],
  },
}

export const FilteredEmpty: Story = {
  args: {
    esims: [],
    hasSearch: true,
  },
}

export const LongValues: Story = {
  args: {
    esims: [
      {
        ...mockEsims[0],
        id: 987654321012345,
        userId: 9999,
        accountId: 3999,
        imsi: '310150123456789012345678901234',
      },
    ],
    users: [
      {
        ...mockUsers[0],
        id: 9999,
        email: 'operations.team+international-roaming@example.com',
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
      },
    ],
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
