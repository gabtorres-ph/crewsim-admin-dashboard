import { useEffect, useMemo, useState } from 'react'
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
  RiEditLine,
} from '@remixicon/react'

import { listUsers } from '../api/users'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from '../components/ui/Table'
import type {
  SortDirection,
  User,
  UserSortKey,
} from '../types/user'

type DialogMode = 'add' | 'edit' | null

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<UserSortKey>('id')
  const [sortDirection, setSortDirection] =
    useState<SortDirection>('ascending')

  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function loadUsers() {
    setLoading(true)
    setPageError(null)

    try {
      const result = await listUsers()
      setUsers(result)
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : 'Unable to load users',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  function handleSort(column: UserSortKey) {
    if (column === sortKey) {
      setSortDirection((current) =>
        current === 'ascending' ? 'descending' : 'ascending',
      )
      return
    }

    setSortKey(column)
    setSortDirection('ascending')
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return users
    }

    return users.filter((user) =>
      [
        user.id,
        user.email,
        user.language,
        user.currency,
        user.timezone,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [users, search])

  const visibleUsers = useMemo(() => {
    const copy = [...filteredUsers]

    copy.sort((left, right) => {
      const comparison = String(left[sortKey]).localeCompare(
        String(right[sortKey]),
        undefined,
        { numeric: true, sensitivity: 'base' },
      )

      return sortDirection === 'ascending' ? comparison : -comparison
    })

    return copy
  }, [filteredUsers, sortKey, sortDirection])

  function SortableHeader({
    column,
    label,
  }: {
    column: UserSortKey
    label: string
  }) {
    const isActive = sortKey === column
    const SortIcon =
      sortDirection === 'ascending'
        ? RiArrowUpSLine
        : RiArrowDownSLine

    return (
      <TableHeaderCell aria-sort={isActive ? sortDirection : 'none'}>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          onClick={() => handleSort(column)}
        >
          {label}
          {isActive && (
            <SortIcon className="size-4" aria-hidden="true" />
          )}
        </button>
      </TableHeaderCell>
    )
  }

  // Steps 20-23 connect the remaining dialog and mutation state. Keep each
  // value and setter referenced until those controls are implemented.
  void loading
  void pageError
  void dialogMode
  void setDialogMode
  void selectedUser
  void setSelectedUser
  void saving
  void setSaving
  void formError
  void setFormError

  return (
    <section className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-semibold text-white">Users</h1>
      <p className="mt-2 text-sm text-gray-400">
        User management will be added in the next implementation steps.
      </p>

      <Input
        type="search"
        value={search}
        placeholder="Search users..."
        aria-label="Search users"
        onChange={(event) => setSearch(event.target.value)}
        className="mt-6 w-full sm:max-w-sm"
      />

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
        <TableRoot>
          <Table>
            <TableHead>
              <TableRow>
                <SortableHeader column="id" label="ID" />
                <SortableHeader column="email" label="Email" />
                <SortableHeader column="language" label="Language" />
                <SortableHeader column="currency" label="Currency" />
                <SortableHeader column="timezone" label="Timezone" />
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.language}</TableCell>
                  <TableCell>{user.currency}</TableCell>
                  <TableCell>{user.timezone}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        aria-label={`Edit ${user.email}`}
                      >
                        <RiEditLine
                          className="size-4"
                          aria-hidden="true"
                        />
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-950 hover:text-red-300"
                        aria-label={`Delete ${user.email}`}
                      >
                        <RiDeleteBinLine
                          className="size-4"
                          aria-hidden="true"
                        />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </div>
    </section>
  )
}
