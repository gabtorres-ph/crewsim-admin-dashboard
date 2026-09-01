import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef, TableFeatures } from '@tanstack/react-table'

import {
  DataTable,
  type DataTableProps,
} from './DataTable'

type DemoUser = {
  id: number
  name: string
  email: string
  language: string
}

const demoUsers: DemoUser[] = [
  {
    id: 1001,
    name: 'Alex Morgan',
    email: 'alex@example.com',
    language: 'English',
  },
  {
    id: 1002,
    name: 'Bea Santos',
    email: 'bea@example.com',
    language: 'Filipino',
  },
  {
    id: 1003,
    name: 'Charlie Dubois',
    email: 'charlie@example.com',
    language: 'French',
  },
  {
    id: 1004,
    name: 'Dana Kim',
    email: 'dana@example.com',
    language: 'Korean',
  },
  {
    id: 1005,
    name: 'Emilio Garcia',
    email: 'emilio@example.com',
    language: 'Spanish',
  },
  {
    id: 1006,
    name: 'Fatima Noor',
    email: 'fatima@example.com',
    language: 'Arabic',
  },
  {
    id: 1007,
    name: 'Grace Lee',
    email: 'grace@example.com',
    language: 'English',
  },
  {
    id: 1008,
    name: 'Hiro Tanaka',
    email: 'hiro@example.com',
    language: 'Japanese',
  },
  {
    id: 1009,
    name: 'Isabel Costa',
    email: 'isabel@example.com',
    language: 'Portuguese',
  },
  {
    id: 1010,
    name: 'Jon Bell',
    email: 'jon@example.com',
    language: 'English',
  },
  {
    id: 1011,
    name: 'Kira Patel',
    email: 'kira@example.com',
    language: 'Hindi',
  },
  {
    id: 1012,
    name: 'Luca Rossi',
    email: 'luca@example.com',
    language: 'Italian',
  },
]

const columns: ColumnDef<TableFeatures, DemoUser, unknown>[] = [
  { accessorKey: 'id', header: 'ID' },
  {
    id: 'user',
    header: 'User',
    cell: ({ row }) => `${row.original.name} (${row.original.email})`,
  },
  { accessorKey: 'language', header: 'Language' },
]

const search: DataTableProps<DemoUser>['search'] = {
  label: 'Search users',
  placeholder: 'Search by name or email...',
  filterFn: (row, _columnId, filterValue) => {
    const query = String(filterValue).trim().toLowerCase()

    return [row.original.name, row.original.email].some((value) =>
      value.toLowerCase().includes(query),
    )
  },
}

type StoryProps = DataTableProps<DemoUser>

const meta = {
  title: 'Components/UI/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    data: demoUsers,
    columns,
    getRowId: (user) => String(user.id),
    search,
    filters: [
      {
        columnId: 'language',
        label: 'Language',
        options: [
          { label: 'Arabic', value: 'Arabic' },
          { label: 'English', value: 'English' },
          { label: 'Filipino', value: 'Filipino' },
          { label: 'French', value: 'French' },
          { label: 'Hindi', value: 'Hindi' },
          { label: 'Italian', value: 'Italian' },
          { label: 'Japanese', value: 'Japanese' },
          { label: 'Korean', value: 'Korean' },
          { label: 'Portuguese', value: 'Portuguese' },
          { label: 'Spanish', value: 'Spanish' },
        ],
      },
    ],
    emptyState: {
      noData: 'No users have been added.',
      noResults: 'No users match the active search or filters.',
    },
  },
} satisfies Meta<StoryProps>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoData: Story = {
  args: {
    data: [],
  },
}

export const NoResults: Story = {
  args: {
    search: {
      ...search,
      filterFn: () => false,
    },
  },
}
