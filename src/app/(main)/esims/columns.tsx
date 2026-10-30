"use client"

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/Checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader"
import { DataTableRowActions } from "@/components/ui/data-table/DataTableRowActions"
import type { EsimRead } from "./types"

const helper = createColumnHelper<EsimRead>()
const displayNullable = (value: string | number | null) => value ?? "—"

function formatActivationDate(value: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`
}

export function getEsimColumns({
  onView,
  onEdit,
  onDelete,
  onRefresh,
  onNetworkStatus,
  refreshingEsimIds,
  userEmailsById,
}: {
  onView: (esim: EsimRead) => void
  onEdit: (esim: EsimRead) => void
  onDelete: (esim: EsimRead) => void
  onRefresh: (esim: EsimRead) => void
  onNetworkStatus: (esim: EsimRead) => void
  refreshingEsimIds: ReadonlySet<number>
  userEmailsById: ReadonlyMap<number, string>
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
    helper.accessor((esim) => esim.user_id === null ? "Unassigned" : userEmailsById.get(esim.user_id) ?? "User unavailable", {
      id: "user_email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User email" />
      ),
      cell: ({ getValue }) => getValue(),
      sortingFn: "text",
      meta: { displayName: "User email" },
    }),
    helper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ getValue }) => displayNullable(getValue()),
      meta: { displayName: "Name" },
    }),
    helper.accessor("imsi", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="IMSI" />
      ),
      meta: { displayName: "IMSI" },
    }),
    helper.accessor("balance", {
      header: "Balance",
      cell: ({ getValue }) => displayNullable(getValue()),
      meta: { className: "tabular-nums", displayName: "Balance" },
    }),
    helper.accessor("networkstatus", {
      header: "Network Status",
      cell: ({ getValue }) => displayNullable(getValue()),
      meta: { displayName: "Network Status" },
    }),
    helper.accessor("activationdate", {
      header: "Activation Date",
      cell: ({ getValue }) => formatActivationDate(getValue()),
      meta: { className: "tabular-nums", displayName: "Activation Date" },
    }),
    helper.accessor("account_id", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account ID" />
      ),
      meta: { className: "tabular-nums", displayName: "Account ID" },
    }),
    helper.accessor("imei_device", {
      header: "IMEI Device",
      cell: ({ getValue }) => displayNullable(getValue()),
      meta: { displayName: "IMEI Device" },
    }),
    helper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          rowLabel={row.original.name ?? row.original.imsi}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          customActions={[
            {
              id: "network-status",
              label: "Network Status",
              onSelect: onNetworkStatus,
            },
            {
              id: "refresh",
              label: refreshingEsimIds.has(row.original.id) ? "Refreshing…" : "Refresh",
              onSelect: onRefresh,
              disabled: refreshingEsimIds.has(row.original.id),
            },
          ]}
        />
      ),
      meta: { displayName: "Actions" },
    }),
  ] as ColumnDef<EsimRead>[]
}
