import { useEffect, useMemo, useState } from 'react'
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
  RiEditLine,
} from '@remixicon/react'

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
import type { Account, AccountSortKey } from '../types/accounts'
import type { SortDirection } from '../types/sort'
import type { User } from '../types/user'

type DialogMode = 'add' | 'edit' | null

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<AccountSortKey>('id')
  const [sortDirection, setSortDirection] =
    useState<SortDirection>('ascending')
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

  function handleSort(column: AccountSortKey) {
    if (column === sortKey) {
      setSortDirection((current) =>
        current === 'ascending' ? 'descending' : 'ascending',
      )
      return
    }

    setSortKey(column)
    setSortDirection('ascending')
  }

  const visibleAccounts = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matchingAccounts = query
      ? accounts.filter((account) =>
          [account.id, account.name, account.balance]
            .join(' ')
            .toLowerCase()
            .includes(query),
        )
      : accounts

    return [...matchingAccounts].sort((left, right) => {
      const comparison = String(left[sortKey]).localeCompare(
        String(right[sortKey]),
        undefined,
        { numeric: true, sensitivity: 'base' },
      )

      return sortDirection === 'ascending' ? comparison : -comparison
    })
  }, [accounts, search, sortDirection, sortKey])

  if (loading) {
    return (
      <div
        className="rounded-lg border border-gray-800 bg-gray-950 p-12 text-center text-sm text-gray-400"
        role="status"
      >
        Loading accounts...
      </div>
    )
  }

  if (pageError) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-900 bg-red-950/40 p-6 text-red-200"
      >
        <p>{pageError}</p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadAccounts()}
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Accounts</h1>
          <p className="mt-2 text-sm text-gray-400">
            View and manage account balances.
          </p>
        </div>
        <Button type="button" onClick={openAddDialog} className="gap-1.5">
          <RiAddLine className="size-4" aria-hidden="true" />
          Add account
        </Button>
      </header>

      <Input
        type="search"
        value={search}
        placeholder="Search accounts..."
        aria-label="Search accounts"
        onChange={(event) => setSearch(event.target.value)}
        className="mt-6 w-full sm:max-w-sm"
      />

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
        <TableRoot>
          <Table>
            <TableHead>
              <TableRow>
                <SortableHeader
                  column="id"
                  label="ID"
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  column="name"
                  label="Name"
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  column="balance"
                  label="Balance"
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.id}</TableCell>
                  <TableCell className="font-medium text-white">
                    {account.name}
                  </TableCell>
                  <TableCell>{account.balance.toLocaleString()}</TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}

              {visibleAccounts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-gray-400"
                  >
                    {search
                      ? 'No accounts match your search.'
                      : 'No accounts have been added yet.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableRoot>
      </div>

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

type SortableHeaderProps = {
  column: AccountSortKey
  label: string
  sortKey: AccountSortKey
  sortDirection: SortDirection
  onSort: (column: AccountSortKey) => void
}

function SortableHeader({
  column,
  label,
  sortKey,
  sortDirection,
  onSort,
}: SortableHeaderProps) {
  const isActive = sortKey === column
  const SortIcon = sortDirection === 'ascending'
    ? RiArrowUpSLine
    : RiArrowDownSLine

  return (
    <TableHeaderCell aria-sort={isActive ? sortDirection : 'none'}>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        onClick={() => onSort(column)}
      >
        {label}
        {isActive && <SortIcon className="size-4" aria-hidden="true" />}
      </button>
    </TableHeaderCell>
  )
}
