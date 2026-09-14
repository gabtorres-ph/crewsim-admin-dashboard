"use client"

import { Checkbox } from "@/shared/ui/Checkbox"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/shared/ui/data-table/DataColumnHeader"
import type { SmsRead } from "../model"

export type SmsTableRow = SmsRead

const columnHelper = createColumnHelper<SmsTableRow>()

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
  columnHelper.accessor("user_id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Id" />
    ),
    meta: { className: "text-left", displayName: "User Id" },
  }),
  columnHelper.accessor("sender", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sender" />
    ),
    meta: { className: "text-left", displayName: "Sender" },
  }),
  columnHelper.accessor("sms_text", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SMS Text" />
    ),
    meta: { className: "text-left", displayName: "SMS Text" },
  }),
  columnHelper.accessor("language", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Language" />
    ),
    meta: { className: "text-left", displayName: "Language" },
  }),
  columnHelper.accessor("created_at", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    meta: { className: "text-left", displayName: "Created" },
  }),
] as ColumnDef<SmsTableRow>[]
