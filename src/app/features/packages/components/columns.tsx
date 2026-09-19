"use client"

import { Checkbox } from "@/shared/ui/Checkbox"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/shared/ui/data-table/DataColumnHeader"
import type { PackageRead } from "../model"

export type PackageTableRow = PackageRead

const columnHelper = createColumnHelper<PackageTableRow>()

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
  columnHelper.accessor("sku", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
    meta: { className: "text-left", displayName: "SKU" },
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    meta: { className: "text-left", displayName: "Name" },
  }),
  columnHelper.accessor("price", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    meta: { className: "text-left", displayName: "Price" },
  }),
  columnHelper.accessor("points", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Points" />
    ),
    meta: { className: "text-left", displayName: "Points" },
  }),
] as ColumnDef<PackageTableRow>[]
