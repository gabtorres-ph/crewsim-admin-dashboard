"use client"

import { Button } from "@/components/Button"
import { Checkbox } from "@/components/Checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader"
import { RiDeleteBinLine } from "@remixicon/react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import type { FavoriteRead } from "./types"

const columnHelper = createColumnHelper<FavoriteRead>()

export function getFavoriteColumns(onDelete: (favorite: FavoriteRead) => void) {
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
          aria-label="Select all favorites"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={() => row.toggleSelected()}
          className="translate-y-0.5"
          aria-label={`Select favorite ${row.original.id}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { displayName: "Select" },
    }),
    columnHelper.accessor("id", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      enableSorting: true,
      meta: { className: "text-left tabular-nums", displayName: "ID" },
    }),
    columnHelper.accessor("user_id", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="User ID" />,
      enableSorting: true,
      meta: { className: "text-left tabular-nums", displayName: "User ID" },
    }),
    columnHelper.accessor("country", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
      enableSorting: true,
      meta: { className: "text-left", displayName: "Country" },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400"
          aria-label={`Delete favorite ${row.original.country}`}
          onClick={(event) => {
            event.stopPropagation()
            onDelete(row.original)
          }}
        >
          <RiDeleteBinLine className="size-4" aria-hidden="true" />
        </Button>
      ),
      meta: { className: "text-left", displayName: "Actions" },
    }),
  ] as ColumnDef<FavoriteRead>[]
}
