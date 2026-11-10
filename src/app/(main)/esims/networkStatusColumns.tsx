"use client";

import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { NetworkStatusRecord } from "./types";

const columnHelper = createColumnHelper<NetworkStatusRecord>();

function formatDate(value: string | null): string {
  if (!value) return "Ongoing";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

export const networkStatusColumns = [
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    meta: { displayName: "Status" },
  }),
  columnHelper.accessor("start", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start" />
    ),
    cell: ({ getValue }) => formatDate(getValue()),
    meta: { className: "tabular-nums", displayName: "Start" },
  }),
  columnHelper.accessor("end", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End" />
    ),
    cell: ({ getValue }) => formatDate(getValue()),
    meta: { className: "tabular-nums", displayName: "End" },
  }),
  columnHelper.accessor("profile_type", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Profile type" />
    ),
    meta: { displayName: "Profile type" },
  }),
  columnHelper.accessor("status_modification", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status modification" />
    ),
    meta: { displayName: "Status modification" },
  }),
  columnHelper.accessor("id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Record ID" />
    ),
    meta: { className: "tabular-nums", displayName: "Record ID" },
  }),
  columnHelper.accessor("sim_id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SIM ID" />
    ),
    meta: { className: "tabular-nums", displayName: "SIM ID" },
  }),
  columnHelper.accessor("imsi", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IMSI" />
    ),
    meta: { className: "tabular-nums", displayName: "IMSI" },
  }),
] as ColumnDef<NetworkStatusRecord>[];
