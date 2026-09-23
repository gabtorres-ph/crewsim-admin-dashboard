"use client"

import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader"
import type { ConditionFilter } from "@/components/ui/data-table/DataTableFilter"
import {
  createColumnHelper,
  type ColumnDef,
  type FilterFn,
} from "@tanstack/react-table"
import type { AccountRead } from "./types"

const columnHelper = createColumnHelper<AccountRead>()

const balanceFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const filterBalance: FilterFn<AccountRead> = (
  row,
  columnId,
  filterValue: ConditionFilter,
) => {
  const value = row.getValue<number>(columnId)
  const [rawMin, rawMax] = filterValue.value

  if (rawMin === "") return true

  const min = Number(rawMin)
  const max = Number(rawMax)

  if (!Number.isFinite(min)) return true

  switch (filterValue.condition) {
    case "is-equal-to":
      return value === min
    case "is-between":
      return Number.isFinite(max) && value >= min && value <= max
    case "is-greater-than":
      return value > min
    case "is-less-than":
      return value < min
    default:
      return true
  }
}

export const accountColumns = [
  columnHelper.accessor("id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    enableSorting: true,
    meta: {
      className: "text-right tabular-nums",
      displayName: "ID",
    },
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Name",
    },
  }),
  columnHelper.accessor("balance", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Balance" />
    ),
    cell: ({ getValue }) => (
      <span className="font-medium tabular-nums">
        {balanceFormatter.format(getValue())}
      </span>
    ),
    enableSorting: true,
    filterFn: filterBalance,
    meta: {
      className: "text-right tabular-nums",
      displayName: "Balance",
    },
  }),
] as ColumnDef<AccountRead>[]

export function formatAccountBalance(value: number) {
  return balanceFormatter.format(value)
}
