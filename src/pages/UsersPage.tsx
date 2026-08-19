import { useEffect, useMemo, useState } from 'react'
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
  RiEditLine,
} from '@remixicon/react'

import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from '../api/users'
import { UserFormDialog } from '../components/UserFormDialog'
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
  User,
  UserInput,
  UserSortKey,
} from '../types/user'
import type { SortDirection } from '../types/sort'

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

  function openAddDialog() {
    setSelectedUser(null)
    setFormError(null)
    setDialogMode('add')
  }

  function openEditDialog(user: User) {
    setSelectedUser(user)
    setFormError(null)
    setDialogMode('edit')
  }

  function handleDialogOpenChange(open: boolean) {
    if (!open && !saving) {
      setDialogMode(null)
      setSelectedUser(null)
      setFormError(null)
    }
  }

  async function handleSave(input: UserInput) {
    setSaving(true)
    setFormError(null)

    try {
      if (dialogMode === 'add') {
        await createUser(input)
      } else if (dialogMode === 'edit' && selectedUser) {
        await updateUser(selectedUser.id, input)
      }

      await loadUsers()
      setDialogMode(null)
      setSelectedUser(null)
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to save user',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user: User) {
    const confirmed = window.confirm(
      `Delete ${user.email}? This action cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    setPageError(null)

    try {
      await deleteUser(user.id)
      await loadUsers()
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : 'Unable to delete user',
      )
    }
  }

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

  if (loading) {
    return (
      <div
        className="rounded-lg border border-gray-800 bg-gray-950 p-12 text-center text-sm text-gray-400"
        role="status"
      >
        Loading users...
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="rounded-lg border border-red-900 bg-red-950/40 p-6 text-red-200">
        <p>{pageError}</p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadUsers()}
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Users</h1>
          <p className="mt-2 text-sm text-gray-400">
            Create, find, and update users.
          </p>
        </div>

        <Button type="button" onClick={openAddDialog}>
          Add user
        </Button>
      </div>

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
              {visibleUsers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-gray-400"
                  >
                    {search
                      ? 'No users match your search.'
                      : 'No users have been added yet.'}
                  </TableCell>
                </TableRow>
              )}

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
                        onClick={() => openEditDialog(user)}
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
                        onClick={() => void handleDelete(user)}
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

      {dialogMode && (
        <UserFormDialog
          key={`${dialogMode}-${selectedUser?.id ?? 'new'}`}
          mode={dialogMode}
          user={selectedUser}
          open={true}
          saving={saving}
          error={formError}
          onOpenChange={handleDialogOpenChange}
          onSubmit={handleSave}
        />
      )}
    </section>
  )
}
