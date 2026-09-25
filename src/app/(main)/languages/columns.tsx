"use client";

import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { LanguageRead } from "./types";

const columnHelper = createColumnHelper<LanguageRead>();
const display = (value: string | null) => value ?? "—";

export const languageColumns = [
  columnHelper.accessor("id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "ID" },
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    enableSorting: true,
    meta: { displayName: "Name" },
  }),
  columnHelper.accessor("iso1", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ISO 639-1" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { displayName: "ISO 639-1" },
  }),
  columnHelper.accessor("iso2b", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ISO 639-2/B" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { displayName: "ISO 639-2/B" },
  }),
  columnHelper.accessor("iso2t", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ISO 639-2/T" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { displayName: "ISO 639-2/T" },
  }),
  columnHelper.accessor("iso3", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ISO 639-3" />
    ),
    enableSorting: true,
    meta: { displayName: "ISO 639-3" },
  }),
] as ColumnDef<LanguageRead>[];
