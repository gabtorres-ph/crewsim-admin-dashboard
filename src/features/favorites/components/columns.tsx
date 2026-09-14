"use client"

import { Checkbox } from "@/shared/ui/Checkbox"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/shared/ui/data-table/DataColumnHeader"
import type { FavoriteRead } from "../model"

export type FavoriteTableRow = FavoriteRead

const columnHelper = createColumnHelper<FavoriteTableRow>()

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
  columnHelper.accessor("country", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Country" />
    ),
    meta: { className: "text-left", displayName: "Country" },
  }),
] as ColumnDef<FavoriteTableRow>[]
