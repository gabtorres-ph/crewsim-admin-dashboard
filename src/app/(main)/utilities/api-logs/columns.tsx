"use client";

import { Badge, type BadgeProps } from "@/components/Badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/ui/data-table/DataTableRowActions";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { RequestLogEntry } from "./types";

const columnHelper = createColumnHelper<RequestLogEntry>();
export const display = (value: string | number | boolean | null) => {
  if (value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value;
};

/** Formats in UTC so server and client renders produce identical markup. */
export function formatTimestamp(ts: number): string {
  return `${new Date(ts).toISOString().slice(0, 19).replace("T", " ")} UTC`;
}

export function getStatusVariant(status: number): BadgeProps["variant"] {
  if (status >= 500) return "error";
  if (status >= 400) return "warning";
  if (status >= 200 && status < 300) return "success";
  return "neutral";
}

export function getApiLogColumns(onView: (log: RequestLogEntry) => void) {
  return [
    columnHelper.accessor("ts", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Timestamp" />
      ),
      cell: ({ getValue }) => formatTimestamp(getValue()),
      enableSorting: true,
      meta: { className: "tabular-nums", displayName: "Timestamp" },
    }),
    columnHelper.accessor("method", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Method" />
      ),
      cell: ({ getValue }) => <Badge variant="neutral">{getValue()}</Badge>,
      enableSorting: true,
      meta: { displayName: "Method" },
    }),
    columnHelper.accessor("path", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Path" />
      ),
      enableSorting: true,
      meta: { className: "font-mono text-xs", displayName: "Path" },
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ getValue }) => (
        <Badge variant={getStatusVariant(getValue())}>{getValue()}</Badge>
      ),
      enableSorting: true,
      meta: { className: "tabular-nums", displayName: "Status" },
    }),
    columnHelper.accessor("duration_ms", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration (ms)" />
      ),
      enableSorting: true,
      meta: { className: "tabular-nums", displayName: "Duration (ms)" },
    }),
    columnHelper.accessor("user_id", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User ID" />
      ),
      enableSorting: true,
      meta: { displayName: "User ID" },
    }),
    columnHelper.accessor("caller_ip", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Caller IP" />
      ),
      enableSorting: true,
      meta: { className: "tabular-nums", displayName: "Caller IP" },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          rowLabel={`Request ${row.original.request_id}`}
          onView={onView}
        />
      ),
      meta: { displayName: "Actions" },
    }),
  ] as ColumnDef<RequestLogEntry>[];
}
