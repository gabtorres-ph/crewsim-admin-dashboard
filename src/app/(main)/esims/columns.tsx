"use client"

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/Checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader"
import { DataTableRowActions } from "@/components/ui/data-table/DataTableRowActions"
import type { EsimRead } from "./types"

const helper = createColumnHelper<EsimRead>()
const text = (value: string | null) => value ?? "—"
export function getEsimColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (esim: EsimRead) => void
  onDelete: (esim: EsimRead) => void
}) {
  return [
    helper.display({
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
          aria-label="Select all eSIMs"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={() => row.toggleSelected()}
          className="translate-y-0.5"
          aria-label={`Select ${row.original.name ?? row.original.imsi}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { displayName: "Select" },
    }),
    helper.accessor("id", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      meta: { className: "tabular-nums", displayName: "ID" },
    }),
    helper.accessor("imsi", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="IMSI" />
      ),
      meta: { displayName: "IMSI" },
    }),
    helper.accessor("account_id", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account" />
      ),
      meta: { className: "tabular-nums", displayName: "Account" },
    }),
    helper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ getValue }) => text(getValue()),
      meta: { displayName: "Name" },
    }),
    helper.accessor("networkstatus", {
      header: "Network",
      cell: ({ getValue }) => text(getValue()),
      meta: { displayName: "Network" },
    }),
    helper.accessor("balance", {
      header: "Balance",
      cell: ({ getValue }) => (getValue() === null ? "—" : getValue()),
      meta: { className: "tabular-nums", displayName: "Balance" },
    }),
    helper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          rowLabel={row.original.name ?? row.original.imsi}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
      meta: { displayName: "Actions" },
    }),
  ] as ColumnDef<EsimRead>[]
}
