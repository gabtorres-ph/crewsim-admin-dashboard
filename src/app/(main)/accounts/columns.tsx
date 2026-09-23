"use client"

import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader"
import { Button } from "@/components/Button"
import { Checkbox } from "@/components/Checkbox"
import { RiDeleteBinLine, RiEditLine } from "@remixicon/react"
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

export type AccountColumnActions = {
  onEdit: (account: AccountRead) => void
  onDelete: (account: AccountRead) => void
}

export function getAccountColumns({ onEdit, onDelete }: AccountColumnActions) {
  return [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomeRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={() => table.toggleAllPageRowsSelected()}
          className="translate-y-0.5"
          aria-label="Select all accounts"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={() => row.toggleSelected()}
          className="translate-y-0.5"
          aria-label={`Select ${row.original.name}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        displayName: "Select",
      },
    }),
    columnHelper.accessor("id", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      enableSorting: true,
      meta: {
        className: "text-left tabular-nums",
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
        className: "text-left tabular-nums",
        displayName: "Balance",
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-start gap-1">
          <Button
            type="button"
            variant="ghost"
            className="p-1.5"
            aria-label={`Edit ${row.original.name}`}
            onClick={(event) => {
              event.stopPropagation()
              onEdit(row.original)
            }}
          >
            <RiEditLine className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400"
            aria-label={`Delete ${row.original.name}`}
            onClick={(event) => {
              event.stopPropagation()
              onDelete(row.original)
            }}
          >
            <RiDeleteBinLine className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ),
      meta: { className: "text-left", displayName: "Actions" },
    }),
  ] as ColumnDef<AccountRead>[]
}

export function formatAccountBalance(value: number) {
  return balanceFormatter.format(value)
}
