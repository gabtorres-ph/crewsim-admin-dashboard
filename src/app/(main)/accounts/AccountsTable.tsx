"use client"

import { DataTable } from "@/components/ui/data-table/DataTable"
import { Button } from "@/components/Button"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar"
import { AccountFormDialog } from "./AccountFormDialog"
import { deleteAccountAction } from "./actions"
import { formatAccountBalance, getAccountColumns } from "./columns"
import type { AccountRead } from "./types"

const balanceConditions = [
  { value: "is-equal-to", label: "is equal to" },
  { value: "is-between", label: "is between" },
  { value: "is-greater-than", label: "is greater than" },
  { value: "is-less-than", label: "is less than" },
]

const toolbar = {
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
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [actionError, setActionError] = useState<string>()
  const [isDeleting, startDeleteTransition] = useTransition()

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
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {accounts.length} account{accounts.length === 1 ? "" : "s"}
        </p>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Add account
        </Button>
      </div>
      {actionError && (
        <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
          {actionError}
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
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
      <AccountFormDialog
        mode="edit"
        account={editingAccount}
        open={editingAccount !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditingAccount(undefined)
        }}
      />
      {isDeleting && (
        <span className="sr-only" role="status">
          Deleting account
        </span>
      )}
    </>
  )
}
