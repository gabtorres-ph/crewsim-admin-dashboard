import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef, TableFeatures } from '@tanstack/react-table'
import { expect, userEvent, within } from 'storybook/test'

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
  { accessorKey: 'id', header: 'ID', sortDescFirst: false },
  {
    id: 'user',
    accessorFn: (user) => user.name,
    header: 'User',
    cell: ({ row }) => `${row.original.name} (${row.original.email})`,
    sortDescFirst: false,
  },
  {
    accessorKey: 'language',
    header: 'Language',
    filterFn: (row, columnId, filterValue) =>
      row.getValue<string>(columnId) === filterValue,
  },
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
  component: DataTable<DemoUser>,
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

export const Default: Story = {
  parameters: {
    chromatic: {
      viewports: [320, 1280],
    },
  },
}

export const Sorting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const userHeader = canvas.getByRole('columnheader', { name: 'User' })
    const userSortButton = canvas.getByRole('button', { name: 'User' })

    await userEvent.click(userSortButton)

    await expect(userHeader).toHaveAttribute('aria-sort', 'ascending')
    await expect(
      canvas.getByRole('columnheader', { name: 'ID' }),
    ).toHaveAttribute('aria-sort', 'none')
    await expect(
      canvas.getByRole('columnheader', { name: 'Language' }),
    ).toHaveAttribute('aria-sort', 'none')
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Alex Morgan')

    await userEvent.click(userSortButton)

    await expect(userHeader).toHaveAttribute('aria-sort', 'descending')
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Luca Rossi')
  },
}

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const searchbox = canvas.getByRole('searchbox', { name: 'Search users' })
    const languageFilter = canvas.getByRole('combobox', { name: 'Language' })
    const idSortButton = canvas.getByRole('button', { name: 'ID' })

    searchbox.focus()
    await expect(searchbox).toHaveFocus()

    await userEvent.tab()
    await expect(languageFilter).toHaveFocus()

    await userEvent.tab()
    await expect(idSortButton).toHaveFocus()
    await expect(idSortButton).toHaveClass('focus-visible:outline-2')
    await userEvent.keyboard('{Enter}')
    await expect(
      canvas.getByRole('columnheader', { name: 'ID' }),
    ).toHaveAttribute('aria-sort', 'ascending')

    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'User' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Language' })).toHaveFocus()
    await userEvent.tab()
    await expect(
      canvas.getByRole('combobox', { name: 'Rows per page' }),
    ).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Next' })).toHaveFocus()

    await expect(canvas.getByRole('table').parentElement).toHaveClass(
      'overflow-auto',
    )
  },
}

export const GlobalSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search users' }),
      'kira',
    )

    await expect(canvas.getByText(/Kira Patel/)).toBeVisible()
    await expect(canvas.queryByText(/Alex Morgan/)).not.toBeInTheDocument()
    await expect(canvas.getByText('1 result')).toBeVisible()
  },
}

export const SelectFilter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const languageFilter = canvas.getByRole('combobox', { name: 'Language' })

    await userEvent.selectOptions(languageFilter, 'English')

    await expect(canvas.getByText(/Alex Morgan/)).toBeVisible()
    await expect(canvas.getByText(/Grace Lee/)).toBeVisible()
    await expect(canvas.getByText(/Jon Bell/)).toBeVisible()
    await expect(canvas.queryByText(/Bea Santos/)).not.toBeInTheDocument()
    await expect(canvas.getByText('3 results')).toBeVisible()

    await userEvent.selectOptions(languageFilter, '')

    await expect(canvas.getByText('12 results')).toBeVisible()
    await expect(canvas.getByText(/Bea Santos/)).toBeVisible()
  },
}

export const NoData: Story = {
  args: {
    data: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('No users have been added.')).toBeVisible()
    await expect(canvas.getByText('0 results')).toBeVisible()
    await expect(canvas.getByText('No pages')).toBeVisible()
  },
}

export const NoResults: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search users' }),
      'not-a-demo-user',
    )

    await expect(
      canvas.getByText('No users match the active search or filters.'),
    ).toBeVisible()
    await expect(canvas.getByText('0 results')).toBeVisible()
    await expect(canvas.getByText('No pages')).toBeVisible()
  },
}

export const PaginationAndPageSize: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Page 1 of 2')).toBeVisible()
    await expect(canvas.getByText(/Alex Morgan/)).toBeVisible()
    await expect(canvas.queryByText(/Luca Rossi/)).not.toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }))

    await expect(canvas.getByText('Page 2 of 2')).toBeVisible()
    await expect(canvas.getByText(/Kira Patel/)).toBeVisible()
    await expect(canvas.getByText(/Luca Rossi/)).toBeVisible()
    await expect(canvas.queryByText(/Alex Morgan/)).not.toBeInTheDocument()

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: 'Rows per page' }),
      '25',
    )

    await expect(canvas.getByText('Page 1 of 1')).toBeVisible()
    await expect(canvas.getByText(/Alex Morgan/)).toBeVisible()
    await expect(canvas.getByText(/Luca Rossi/)).toBeVisible()
  },
}

export const SearchResetsPagination: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }))
    await expect(canvas.getByText('Page 2 of 2')).toBeVisible()

    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search users' }),
      'luca',
    )

    await expect(canvas.getByText('Page 1 of 1')).toBeVisible()
    await expect(canvas.getByText(/Luca Rossi/)).toBeVisible()
  },
}

export const SelectFilterResetsPagination: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }))
    await expect(canvas.getByText('Page 2 of 2')).toBeVisible()

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: 'Language' }),
      'English',
    )

    await expect(canvas.getByText('Page 1 of 1')).toBeVisible()
    await expect(canvas.getByText(/Alex Morgan/)).toBeVisible()
  },
}

export const SortingResetsPagination: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }))
    await expect(canvas.getByText('Page 2 of 2')).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'User' }))

    await expect(canvas.getByText('Page 1 of 2')).toBeVisible()
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Alex Morgan')
  },
}

function SourceDataChangeExample(props: StoryProps) {
  const [data, setData] = useState(props.data)

  return (
    <div className="grid gap-4">
      <button
        type="button"
        onClick={() => setData((current) => current.slice(0, 10))}
      >
        Remove later-page rows
      </button>
      <DataTable {...props} data={data} />
    </div>
  )
}

export const SourceDataChangeResetsPagination: Story = {
  render: (args) => <SourceDataChangeExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }))
    await expect(canvas.getByText('Page 2 of 2')).toBeVisible()

    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove later-page rows' }),
    )

    await expect(canvas.getByText('Page 1 of 1')).toBeVisible()
    await expect(canvas.getByText(/Alex Morgan/)).toBeVisible()
  },
}
