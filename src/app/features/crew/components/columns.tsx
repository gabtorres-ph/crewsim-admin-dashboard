"use client"

import { Checkbox } from "@/shared/ui/Checkbox"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/shared/ui/data-table/DataColumnHeader"
import type { CrewRead } from "../model"

export type CrewTableRow = CrewRead

const columnHelper = createColumnHelper<CrewTableRow>()

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
  columnHelper.accessor("unique_id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unique Id" />
    ),
    meta: { className: "text-left", displayName: "Unique Id" },
  }),
  columnHelper.accessor("firstname", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
    meta: { className: "text-left", displayName: "First Name" },
  }),
  columnHelper.accessor("lastname", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
    meta: { className: "text-left", displayName: "Last Name" },
  }),
  columnHelper.accessor("airline", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Airline" />
    ),
    meta: { className: "text-left", displayName: "Airline" },
  }),
  columnHelper.accessor("iscrewid", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Crew Id" />
    ),
    meta: { className: "text-left", displayName: "Crew Id" },
  }),
] as ColumnDef<CrewTableRow>[]
