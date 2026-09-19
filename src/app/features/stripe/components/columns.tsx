"use client"

import { Checkbox } from "@/shared/ui/Checkbox"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/shared/ui/data-table/DataColumnHeader"
import type { StripeNotificationRead } from "../model"

export type StripeNotificationTableRow = StripeNotificationRead

const columnHelper = createColumnHelper<StripeNotificationTableRow>()

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
  columnHelper.accessor("eventid", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event Id" />
    ),
    meta: { className: "text-left", displayName: "Event Id" },
  }),
  columnHelper.accessor("invoiceid", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invoice Id" />
    ),
    meta: { className: "text-left", displayName: "Invoice Id" },
  }),
  columnHelper.accessor("userid", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Id" />
    ),
    meta: { className: "text-left", displayName: "User Id" },
  }),
  columnHelper.accessor("amount_gross", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gross Amount" />
    ),
    meta: { className: "text-left", displayName: "Gross Amount" },
  }),
  columnHelper.accessor("currency", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Currency" />
    ),
    meta: { className: "text-left", displayName: "Currency" },
  }),
  columnHelper.accessor("state", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State" />
    ),
    meta: { className: "text-left", displayName: "State" },
  }),
] as ColumnDef<StripeNotificationTableRow>[]
