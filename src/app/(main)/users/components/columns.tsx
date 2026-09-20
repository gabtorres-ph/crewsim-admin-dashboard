"use client"

import { type User } from "../model/types"
import { Checkbox } from "@/shared/ui/Checkbox"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/shared/ui/data-table/DataColumnHeader"

const columnHelper = createColumnHelper<User>()

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
    meta: {
      displayName: "Select",
    },
  }),
  columnHelper.accessor("id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Id",
    },
  }),
  columnHelper.accessor("email", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="email" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Email",
    },
  }),
  columnHelper.accessor("currency", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Currency" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Currency"
    }
  }),
  columnHelper.accessor("language", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Language" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Language"
    }
  }),
  columnHelper.accessor("timezone", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Timezone" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Timezone"
    }
  }),
  columnHelper.accessor("firstname", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "First Name"
    }
  }),
  columnHelper.accessor("lastname", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Last Name"
    }
  }),
  columnHelper.accessor("airline", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Airline" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Airline"
    }
  }),
] as ColumnDef<User>[]

