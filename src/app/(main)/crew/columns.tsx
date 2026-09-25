"use client";

import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { CrewRead } from "./types";

const columnHelper = createColumnHelper<CrewRead>();
const display = (value: string | number | null | undefined) => value ?? "—";

export const crewColumns = [
  columnHelper.accessor("id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "ID" },
  }),
  columnHelper.accessor("unique_id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unique ID" />
    ),
    enableSorting: true,
    meta: { displayName: "Unique ID" },
  }),
  columnHelper.accessor("firstname", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First name" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { displayName: "First name" },
  }),
  columnHelper.accessor("lastname", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last name" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { displayName: "Last name" },
  }),
  columnHelper.accessor("airline", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Airline" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { displayName: "Airline" },
  }),
  columnHelper.accessor("iscrewid", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Crew ID" />
    ),
    cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
    enableSorting: true,
    meta: { displayName: "Crew ID" },
  }),
  columnHelper.accessor("user_id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User ID" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "User ID" },
  }),
  columnHelper.accessor("createdate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    enableSorting: true,
    meta: { displayName: "Created" },
  }),
] as ColumnDef<CrewRead>[];
