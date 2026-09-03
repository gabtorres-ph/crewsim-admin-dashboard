import { useEffect, useMemo, useState } from 'react'
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
} from '@remixicon/react'
import type { ColumnDef, TableFeatures } from '@tanstack/react-table'

import { Button } from '@/shared/ui/Button'
import { DataTable } from '@/shared/ui/DataTable'
import { StatusPanel } from '@/shared/ui/StatusPanel'

import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from '../api'
import { UserFormDialog } from '../components/UserFormDialog'
import type {
  User,
  UserInput,
} from '../model'

type DialogMode = 'add' | 'edit' | null

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
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

  const columns = useMemo<ColumnDef<TableFeatures, User, unknown>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => {
          const user = row.original

          return user.firstname || user.lastname ? (
            <div>
              <div className="font-medium text-white">
                {[user.firstname, user.lastname].filter(Boolean).join(' ')}
              </div>
              <div className="text-sm text-gray-400">{user.email}</div>
            </div>
          ) : (
            user.email
          )
        },
      },
      {
        id: 'profile',
        header: 'Profile',
        accessorFn: (user) =>
          [user.position, user.airline].filter(Boolean).join(' '),
        enableSorting: false,
        cell: ({ row }) => {
          const user = row.original

          return user.airline || user.position ? (
            <div>
              {user.position && <div>{user.position}</div>}
              {user.airline && (
                <div className="text-sm text-gray-400">{user.airline}</div>
              )}
            </div>
          ) : (
            '—'
          )
        },
      },
      {
        id: 'language',
        accessorKey: 'language',
        header: 'Language',
        filterFn: (row, columnId, filterValue) =>
          row.getValue<string>(columnId) === filterValue,
      },
      {
        id: 'currency',
        accessorKey: 'currency',
        header: 'Currency',
        filterFn: (row, columnId, filterValue) =>
          row.getValue<string>(columnId) === filterValue,
      },
      {
        id: 'timezone',
        accessorKey: 'timezone',
        header: 'Timezone',
        filterFn: (row, columnId, filterValue) =>
          row.getValue<string>(columnId) === filterValue,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const user = row.original

          return (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => openEditDialog(user)}
                aria-label={`Edit ${user.email}`}
              >
                <RiEditLine className="size-4" aria-hidden="true" />
                Edit
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="text-red-400 hover:bg-red-950 hover:text-red-300"
                onClick={() => void handleDelete(user)}
                aria-label={`Delete ${user.email}`}
              >
                <RiDeleteBinLine className="size-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          )
        },
      },
    ],
    [],
  )

  const filters = useMemo(
    () => {
      const optionsFor = (field: 'language' | 'currency' | 'timezone') =>
        [...new Set(users.map((user) => user[field].trim()).filter(Boolean))]
          .sort((left, right) => left.localeCompare(right))
          .map((value) => ({ label: value, value }))

      return [
        {
          columnId: 'language',
          label: 'Language',
          options: optionsFor('language'),
        },
        {
          columnId: 'currency',
          label: 'Currency',
          options: optionsFor('currency'),
        },
        {
          columnId: 'timezone',
          label: 'Timezone',
          options: optionsFor('timezone'),
        },
      ]
    },
    [users],
  )

  if (loading) {
    return (
      <StatusPanel variant="loading">
        Loading users...
      </StatusPanel>
    )
  }

  if (pageError) {
    return (
      <StatusPanel
        variant="error"
        onRetry={() => void loadUsers()}
      >
        {pageError}
      </StatusPanel>
    )
  }

  return (
    <section className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-50">
            Users
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Create, find, and update users.
          </p>
        </div>

        <Button type="button" onClick={openAddDialog} className="gap-1.5">
          <RiAddLine className="size-4" aria-hidden="true" />
          Add user
        </Button>
      </header>

      <DataTable
        data={users}
        columns={columns}
        getRowId={(user) => String(user.id)}
        search={{
          label: 'Search users',
          placeholder: 'Search users...',
          filterFn: (row, _columnId, filterValue) => {
            const query = String(filterValue).trim().toLowerCase()

            return [
              row.original.id,
              row.original.email,
              row.original.language,
              row.original.currency,
              row.original.timezone,
              row.original.firstname,
              row.original.lastname,
              row.original.airline,
              row.original.position,
            ]
              .join(' ')
              .toLowerCase()
              .includes(query)
          },
        }}
        filters={filters}
        emptyState={{
          noData: 'No users have been added yet.',
          noResults: 'No users match your search.',
        }}
        className="mt-8"
      />

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
