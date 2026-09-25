"use client";

import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { SmsRead } from "./types";

const columnHelper = createColumnHelper<SmsRead>();
const display = (value: string | number | null) => value ?? "—";

export const smsColumns = [
  columnHelper.accessor("id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "ID" },
  }),
  columnHelper.accessor("created_at", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    enableSorting: true,
    meta: { displayName: "Created" },
  }),
  columnHelper.accessor("sender", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sender" />
    ),
    enableSorting: true,
    meta: { displayName: "Sender" },
  }),
  columnHelper.accessor("sms_text", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Message" />
    ),
    cell: ({ getValue }) => (
      <span className="block max-w-md truncate" title={getValue()}>
        {getValue()}
      </span>
    ),
    enableSorting: true,
    meta: { displayName: "Message" },
  }),
  columnHelper.accessor("imsi", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IMSI" />
    ),
    enableSorting: true,
    meta: { displayName: "IMSI" },
  }),
  columnHelper.accessor("user_id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User ID" />
    ),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "User ID" },
  }),
  columnHelper.accessor("language", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Language" />
    ),
    enableSorting: true,
    meta: { displayName: "Language" },
  }),
  columnHelper.accessor("template", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Template" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { displayName: "Template" },
  }),
  columnHelper.accessor("sent_at", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sent" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { displayName: "Sent" },
  }),
  columnHelper.accessor("sent_result_code", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Result code" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { displayName: "Result code" },
  }),
  columnHelper.accessor("retry_counter", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Retries" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "Retries" },
  }),
] as ColumnDef<SmsRead>[];
