import { useEffect, useMemo, useState } from 'react'
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
} from '@remixicon/react'

import { deleteAccount, listAccounts } from '../api/accounts'
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

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<AccountSortKey>('id')
  const [sortDirection, setSortDirection] =
    useState<SortDirection>('ascending')
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function loadAccounts() {
    setLoading(true)
    setPageError(null)

    try {
      setAccounts(await listAccounts())
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
      <header>
        <h1 className="text-2xl font-semibold text-white">Accounts</h1>
        <p className="mt-2 text-sm text-gray-400">
          View and manage account balances.
        </p>
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
