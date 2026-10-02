"use client";

import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/ui/data-table/DataTableRowActions";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { StripeNotificationRead } from "./types";

const columnHelper = createColumnHelper<StripeNotificationRead>();
export const display = (value: string | number | null) => value ?? "—";

export function getStripeNotificationColumns(
  onView: (notification: StripeNotificationRead) => void,
) {
  return [
    columnHelper.accessor("id", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      enableSorting: true,
      meta: { className: "tabular-nums", displayName: "ID" },
    }),
    columnHelper.accessor("createdate", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      enableSorting: true,
      meta: { displayName: "Created" },
    }),
    columnHelper.accessor("eventid", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event ID" />
      ),
      enableSorting: true,
      meta: { displayName: "Event ID" },
    }),
    columnHelper.accessor("invoiceid", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice ID" />
      ),
      enableSorting: true,
      meta: { displayName: "Invoice ID" },
    }),
    columnHelper.accessor("customerid", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer ID" />
      ),
      enableSorting: true,
      meta: { displayName: "Customer ID" },
    }),
    columnHelper.accessor("userid", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User ID" />
      ),
      enableSorting: true,
      meta: { className: "tabular-nums", displayName: "User ID" },
    }),
    columnHelper.accessor("sku", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU" />
      ),
      enableSorting: true,
      meta: { displayName: "SKU" },
    }),
    columnHelper.accessor("amount_net", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Net" />
      ),
      enableSorting: true,
      meta: { className: "tabular-nums", displayName: "Net" },
    }),
    columnHelper.accessor("amount_tax", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tax" />
      ),
      enableSorting: true,
      meta: { className: "tabular-nums", displayName: "Tax" },
    }),
    columnHelper.accessor("amount_gross", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gross" />
      ),
      enableSorting: true,
      meta: { className: "tabular-nums", displayName: "Gross" },
    }),
    columnHelper.accessor("currency", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Currency" />
      ),
      enableSorting: true,
      meta: { displayName: "Currency" },
    }),
    columnHelper.accessor("state", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="State" />
      ),
      cell: ({ getValue }) => display(getValue()),
      enableSorting: true,
      meta: { displayName: "State" },
    }),
    columnHelper.accessor("imsi", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="IMSI" />
      ),
      cell: ({ getValue }) => display(getValue()),
      enableSorting: true,
      meta: { displayName: "IMSI" },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          rowLabel={`Stripe notification ${row.original.id}`}
          onView={onView}
        />
      ),
      meta: { displayName: "Actions" },
    }),
  ] as ColumnDef<StripeNotificationRead>[];
}
