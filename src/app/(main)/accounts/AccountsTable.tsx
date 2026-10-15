"use client"

import { DataTable } from "@/components/ui/data-table/DataTable"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar"
import { AccountFormDialog } from "./AccountFormDialog"
import { deleteAccountAction, refreshAccountsAction } from "./actions"
import { formatAccountBalance, getAccountColumns } from "./columns"
import type { AccountRead } from "./types"

const balanceConditions = [
  { value: "is-equal-to", label: "is equal to" },
  { value: "is-between", label: "is between" },
  { value: "is-greater-than", label: "is greater than" },
  { value: "is-less-than", label: "is less than" },
]

const toolbarOptions = {
  search: {
    columnId: "name",
    placeholder: "Search accounts...",
  },
  filters: [
    {
      columnId: "balance",
      title: "Balance",
      type: "number",
      options: balanceConditions,
      formatter: (value) => formatAccountBalance(Number(value)),
    },
  ],
  showViewOptions: true,
} satisfies DataTableToolbarConfig

export function AccountsTable({ accounts }: { accounts: AccountRead[] }) {
  const router = useRouter()
  const [editingAccount, setEditingAccount] = useState<AccountRead>()
  const [actionError, setActionError] = useState<string>()
  const [refreshSummary, setRefreshSummary] = useState<string>()
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isRefreshing, startRefreshTransition] = useTransition()

  const toolbar = {
    ...toolbarOptions,
    primaryAction: {
      label: "Refresh",
      onClick: refreshAccounts,
      loading: isRefreshing,
    },
  } satisfies DataTableToolbarConfig

  function refreshAccounts() {
    setActionError(undefined)
    setRefreshSummary(undefined)
    startRefreshTransition(() => {
      void (async () => {
        const result = await refreshAccountsAction()
        if (!result.ok) {
          setActionError(result.error)
          return
        }
        const { fetched, created, updated, deleted } = result.summary
        setRefreshSummary(
          `Refreshed: ${fetched} fetched, ${created} created, ${updated} updated, ${deleted} deleted.`,
        )
        router.refresh()
      })()
    })
  }

  function deleteAccount(account: AccountRead) {
    if (!window.confirm(`Delete account “${account.name}”?`)) return

    setActionError(undefined)
    startDeleteTransition(() => {
      void (async () => {
        const result = await deleteAccountAction(account.id)
        if (!result.ok) {
          setActionError(result.error)
          return
        }
        router.refresh()
      })()
    })
  }

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {accounts.length} account{accounts.length === 1 ? "" : "s"}
        </p>
      </div>
      {actionError && (
        <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
          {actionError}
        </p>
      )}
      {refreshSummary && (
        <p role="status" className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {refreshSummary}
        </p>
      )}
      <DataTable
        columns={getAccountColumns({
          onEdit: setEditingAccount,
          onDelete: deleteAccount,
        })}
        data={accounts}
        emptyMessage="No accounts found."
        enableRowSelection
        getRowId={(account) => String(account.id)}
        pageSize={20}
        toolbar={toolbar}
      />
      <AccountFormDialog
        account={editingAccount}
        open={editingAccount !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditingAccount(undefined)
        }}
      />
      {isRefreshing && (
        <span className="sr-only" role="status">
          Refreshing accounts
        </span>
      )}
      {isDeleting && (
        <span className="sr-only" role="status">
          Deleting account
        </span>
      )}
    </>
  )
}
