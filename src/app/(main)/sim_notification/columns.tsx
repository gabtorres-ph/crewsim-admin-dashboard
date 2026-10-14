"use client";

import { Badge } from "@/components/Badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/ui/data-table/DataTableRowActions";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { SimNotificationRead } from "./types";

const columnHelper = createColumnHelper<SimNotificationRead>();

export function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toISOString().slice(0, 19).replace("T", " ")} UTC`;
}

export function getSimNotificationColumns(
  onView: (notification: SimNotificationRead) => void,
  onDelete: (notification: SimNotificationRead) => void,
) {
  return [
    columnHelper.accessor("id", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      enableSorting: false,
      meta: { className: "tabular-nums", displayName: "ID" },
    }),
    columnHelper.accessor("createdate", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ getValue }) => formatCreatedAt(getValue()),
      enableSorting: false,
      meta: { className: "tabular-nums", displayName: "Created" },
    }),
    columnHelper.accessor("typ", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ getValue }) => <Badge variant="neutral">{getValue()}</Badge>,
      enableSorting: false,
      meta: { displayName: "Type" },
    }),
    columnHelper.accessor("imsi", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="IMSI" />,
      enableSorting: false,
      meta: { className: "font-mono tabular-nums", displayName: "IMSI" },
    }),
    columnHelper.accessor("provider", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Provider" />,
      enableSorting: false,
      meta: { displayName: "Provider" },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          rowLabel={`SIM notification ${row.original.id}`}
          onView={onView}
          onDelete={onDelete}
        />
      ),
      enableHiding: false,
      meta: { displayName: "Actions" },
    }),
  ] as ColumnDef<SimNotificationRead>[];
}
