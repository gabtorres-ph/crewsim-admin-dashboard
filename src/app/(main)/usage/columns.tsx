"use client";

import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/ui/data-table/DataTableRowActions";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { UsageRead } from "./types";

const columnHelper = createColumnHelper<UsageRead>();
export const display = (value: string | number | null) => value ?? "—";

export type UsageColumnActions = {
  onView: (usage: UsageRead) => void;
  onEdit: (usage: UsageRead) => void;
  onDelete: (usage: UsageRead) => void;
};

export function getUsageColumns({
  onView,
  onEdit,
  onDelete,
}: UsageColumnActions) {
  return [
    columnHelper.accessor("id", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      enableSorting: true,
      meta: { className: "tabular-nums", displayName: "ID" },
    }),
    columnHelper.accessor("usage_date_utc", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usage date" />
      ),
      enableSorting: true,
      meta: { displayName: "Usage date" },
    }),
    columnHelper.accessor("session_id", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Session" />
      ),
      enableSorting: true,
      meta: { displayName: "Session" },
    }),
    columnHelper.accessor("usage_type", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      enableSorting: true,
      meta: { displayName: "Type" },
    }),
    columnHelper.accessor("total_qty", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quantity" />
      ),
      enableSorting: true,
      meta: { className: "tabular-nums", displayName: "Quantity" },
    }),
    columnHelper.accessor("imsi", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="IMSI" />
      ),
      enableSorting: true,
      meta: { displayName: "IMSI" },
    }),
    columnHelper.accessor("subs_account_name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subscriber account" />
      ),
      enableSorting: true,
      meta: { displayName: "Subscriber account" },
    }),
    columnHelper.accessor("custo_charge", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer charge" />
      ),
      cell: ({ getValue }) => display(getValue()),
      enableSorting: true,
      meta: { className: "tabular-nums", displayName: "Customer charge" },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          rowLabel={`usage record ${row.original.id}`}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
      meta: { displayName: "Actions" },
    }),
  ] as ColumnDef<UsageRead>[];
}