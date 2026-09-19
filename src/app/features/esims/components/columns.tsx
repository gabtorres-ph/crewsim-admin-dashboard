"use client"

import { type Esim } from "../model/types"
import { Checkbox } from "@/shared/ui/Checkbox"
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/shared/ui/data-table/DataColumnHeader"

const columnHelper = createColumnHelper<Esim>()

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
  columnHelper.accessor("userId", {
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
  columnHelper.accessor("accountId", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Account",
    },
  }),
  columnHelper.accessor("activationcode", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Activation Code" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Activation Code"
    }
  }),
  columnHelper.accessor("balance", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Balance" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Balance"
    }
  }),
  columnHelper.accessor("imsi", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IMSI" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "IMSI"
    }
  }),
  columnHelper.accessor("smdpserver", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SMDP Server" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "SMDP Server"
    }
  }),
] as ColumnDef<Esim>[]
