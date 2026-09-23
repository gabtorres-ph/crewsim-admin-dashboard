"use client"

import { RiDeleteBinLine, RiEditLine } from "@remixicon/react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/Button"
import { Checkbox } from "@/components/Checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader"
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
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            className="p-1.5"
            aria-label={`Edit ${row.original.imsi}`}
            onClick={(event) => {
              event.stopPropagation()
              onEdit(row.original)
            }}
          >
            <RiEditLine className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="p-1.5 text-red-600"
            aria-label={`Delete ${row.original.imsi}`}
            onClick={(event) => {
              event.stopPropagation()
              onDelete(row.original)
            }}
          >
            <RiDeleteBinLine className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ),
      meta: { displayName: "Actions" },
    }),
  ] as ColumnDef<EsimRead>[]
}
