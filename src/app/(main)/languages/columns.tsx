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
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { displayName: "Code" },
  }),
] as ColumnDef<LanguageRead>[];
