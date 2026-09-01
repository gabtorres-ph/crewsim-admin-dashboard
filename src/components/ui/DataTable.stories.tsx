import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef, TableFeatures } from '@tanstack/react-table'

import {
  DataTable,
  type DataTableProps,
} from './DataTable'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from './Table'

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
          { label: 'English', value: 'English' },
          { label: 'Filipino', value: 'Filipino' },
          { label: 'French', value: 'French' },
        ],
      },
    ],
    emptyState: {
      noData: 'No users have been added.',
      noResults: 'No users match the active search or filters.',
    },
  },
  render: (args) => (
    <>
      <DataTable {...args} />
      <TableRoot className="rounded-lg border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>ID</TableHeaderCell>
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell>Language</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {args.data.map((user) => (
              <TableRow key={args.getRowId(user, 0)}>
                <TableCell>{user.id}</TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                  <div>{user.name}</div>
                  <div className="font-normal text-gray-500 dark:text-gray-400">
                    {user.email}
                  </div>
                </TableCell>
                <TableCell>{user.language}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableRoot>
    </>
  ),
} satisfies Meta<StoryProps>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Static Step 1 contract preview. The table shell is rendered directly until
 * `DataTable` gains its behavior and rendering in Step 2.
 */
export const Default: Story = {}
