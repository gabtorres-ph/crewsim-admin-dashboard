"use client";

import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { UsageRead } from "./types";

const columnHelper = createColumnHelper<UsageRead>();
const display = (value: string | null) => value ?? "—";

export const usageColumns = [
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
] as ColumnDef<UsageRead>[];
