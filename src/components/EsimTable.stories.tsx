import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { mockUsers } from '../mocks/data/users'
import type { Esim } from '../types/esims'
import { EsimTable } from './EsimTable'

const esims: Esim[] = [
  {
    id: 2001,
    userId: 1001,
    imsi: '310150123456789',
  },
  {
    id: 2002,
    userId: 1002,
    imsi: '525010987654321',
  },
  {
    id: 2003,
    userId: 1003,
    imsi: '440100123456789',
  },
]

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
        id: 987654321012345,
        userId: 9999,
        imsi: '310150123456789012345678901234',
      },
    ],
    users: [
      {
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
