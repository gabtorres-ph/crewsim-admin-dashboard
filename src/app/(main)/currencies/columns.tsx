"use client";

import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { CurrencyRead } from "./types";

const columnHelper = createColumnHelper<CurrencyRead>();

export const currencyColumns = [
  columnHelper.accessor("id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "ID" },
  }),
  columnHelper.accessor("code", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    enableSorting: true,
    meta: { displayName: "Code" },
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    enableSorting: true,
    meta: { displayName: "Name" },
  }),
  columnHelper.accessor("symbol", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Symbol" />
    ),
    enableSorting: true,
    meta: { displayName: "Symbol" },
  }),
  columnHelper.accessor("symbol_native", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Native symbol" />
    ),
    enableSorting: true,
    meta: { displayName: "Native symbol" },
  }),
  columnHelper.accessor("decimal_digits", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Decimal digits" />
    ),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "Decimal digits" },
  }),
  columnHelper.accessor("rounding", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rounding" />
    ),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "Rounding" },
  }),
  columnHelper.accessor("iso_numeric", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ISO numeric" />
    ),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "ISO numeric" },
  }),
] as ColumnDef<CurrencyRead>[];
