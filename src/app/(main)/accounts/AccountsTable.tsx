"use client"

import { DataTable } from "@/components/ui/data-table/DataTable"
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar"
import { accountColumns, formatAccountBalance } from "./columns"
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
  return (
    <DataTable
      columns={accountColumns}
      data={accounts}
      emptyMessage="No accounts found."
      getRowId={(account) => String(account.id)}
      pageSize={20}
      toolbar={toolbar}
    />
  )
}
