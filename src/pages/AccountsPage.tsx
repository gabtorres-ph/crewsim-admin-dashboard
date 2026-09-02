import { useEffect, useMemo, useState } from 'react'
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
} from '@remixicon/react'
import type { ColumnDef, TableFeatures } from '@tanstack/react-table'

import {
  createAccount,
  deleteAccount,
  listAccounts,
  updateAccount,
} from '../api/accounts'
import { listUsers } from '../api/users'
import { AccountEsimsDialog } from '../components/AccountEsimsDialog'
import { AccountFormDialog } from '../components/AccountFormDialog'
import { Button } from '../components/ui/Button'
import { DataTable } from '../components/ui/DataTable'
import { StatusPanel } from '../components/ui/StatusPanel'
import type { Account } from '../types/accounts'
import type { User } from '../types/user'

type DialogMode = 'add' | 'edit' | null

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [detailsAccount, setDetailsAccount] = useState<Account | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function loadAccounts() {
    setLoading(true)
    setPageError(null)

    try {
      const [accountResult, userResult] = await Promise.all([
        listAccounts(),
        listUsers(),
      ])

      setAccounts(accountResult)
      setUsers(userResult)
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : 'Unable to load accounts',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAccounts()
  }, [])

  function openAddDialog() {
    setSelectedAccount(null)
    setFormError(null)
    setDialogMode('add')
  }

  function openEditDialog(account: Account) {
    setSelectedAccount(account)
    setFormError(null)
    setDialogMode('edit')
  }

  function handleDialogOpenChange(open: boolean) {
    if (!open && !saving) {
      setDialogMode(null)
      setSelectedAccount(null)
      setFormError(null)
    }
  }

  async function handleSave(input: { name: string; balance: number }) {
    setSaving(true)
    setFormError(null)

    try {
      if (dialogMode === 'add') {
        await createAccount(input)
      } else if (dialogMode === 'edit' && selectedAccount) {
        await updateAccount(selectedAccount.id, input)
      }

      await loadAccounts()
      setDialogMode(null)
      setSelectedAccount(null)
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to save account',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(account: Account) {
    const confirmed = window.confirm(
      `Delete ${account.name}? This action cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingId(account.id)
    setPageError(null)

    try {
      await deleteAccount(account.id)
      await loadAccounts()
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : 'Unable to delete account',
      )
    } finally {
      setDeletingId(null)
    }
  }

  const columns = useMemo<ColumnDef<TableFeatures, Account, unknown>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => (
          <span className="font-medium text-white">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'balance',
        header: 'Balance',
        cell: ({ getValue }) => getValue<number>().toLocaleString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const account = row.original

          return (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={deletingId !== null}
                onClick={() => setDetailsAccount(account)}
                aria-label={`View eSIMs for ${account.name}`}
              >
                View eSIMs
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={deletingId !== null}
                onClick={() => openEditDialog(account)}
                aria-label={`Edit ${account.name}`}
              >
                <RiEditLine className="size-4" aria-hidden="true" />
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                isLoading={deletingId === account.id}
                loadingText="Deleting"
                disabled={deletingId !== null}
                onClick={() => void handleDelete(account)}
                className="gap-1.5 text-red-400 hover:bg-red-950 hover:text-red-300 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                aria-label={`Delete ${account.name}`}
              >
                <RiDeleteBinLine className="size-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          )
        },
      },
    ],
    [deletingId],
  )

  if (loading) {
    return (
      <StatusPanel variant="loading">
        Loading accounts...
      </StatusPanel>
    )
  }

  if (pageError) {
    return (
      <StatusPanel
        variant="error"
        onRetry={() => void loadAccounts()}
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
            Accounts
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            View and manage account balances.
          </p>
        </div>
        <Button type="button" onClick={openAddDialog} className="gap-1.5">
          <RiAddLine className="size-4" aria-hidden="true" />
          Add account
        </Button>
      </header>

      <DataTable
        data={accounts}
        columns={columns}
        getRowId={(account) => String(account.id)}
        search={{
          label: 'Search accounts',
          placeholder: 'Search accounts...',
          filterFn: (row, _columnId, filterValue) => {
            const query = String(filterValue).trim().toLowerCase()

            return [row.original.id, row.original.name, row.original.balance]
              .join(' ')
              .toLowerCase()
              .includes(query)
          },
        }}
        emptyState={{
          noData: 'No accounts have been added yet.',
          noResults: 'No accounts match your search.',
        }}
        className="mt-8"
      />

      {dialogMode && (
        <AccountFormDialog
          key={`${dialogMode}-${selectedAccount?.id ?? 'new'}`}
          mode={dialogMode}
          account={selectedAccount}
          open={true}
          saving={saving}
          error={formError}
          onOpenChange={handleDialogOpenChange}
          onSubmit={handleSave}
        />
      )}

      {detailsAccount && (
        <AccountEsimsDialog
          account={detailsAccount}
          users={users}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setDetailsAccount(null)
            }
          }}
        />
      )}
    </section>
  )
}
