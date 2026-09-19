"use client"

import { Checkbox } from "@/shared/ui/Checkbox"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/shared/ui/data-table/DataColumnHeader"
import type { UsageRead } from "../model"

export type UsageTableRow = UsageRead

const columnHelper = createColumnHelper<UsageTableRow>()

export const columns = [
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
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={() => row.toggleSelected()}
        className="translate-y-0.5"
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { displayName: "Select" },
  }),
  columnHelper.accessor("id", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Id" />,
    meta: { className: "text-left", displayName: "Id" },
  }),
  columnHelper.accessor("usage_date_utc", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usage Date UTC" />
    ),
    meta: { className: "text-left", displayName: "Usage Date UTC" },
  }),
  columnHelper.accessor("imsi", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="IMSI" />,
    meta: { className: "text-left", displayName: "IMSI" },
  }),
  columnHelper.accessor("usage_type", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usage Type" />
    ),
    meta: { className: "text-left", displayName: "Usage Type" },
  }),
  columnHelper.accessor("total_qty", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Qty" />
    ),
    meta: { className: "text-left", displayName: "Total Qty" },
  }),
  columnHelper.accessor("custo_charge", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer Charge" />
    ),
    meta: { className: "text-left", displayName: "Customer Charge" },
  }),
] as ColumnDef<UsageTableRow>[]
