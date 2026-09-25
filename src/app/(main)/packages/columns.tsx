"use client";

import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { PackageRead } from "./types";

const columnHelper = createColumnHelper<PackageRead>();
const display = (value: number | string | null) => value ?? "—";

export const packageColumns = [
  columnHelper.accessor("id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "ID" },
  }),
  columnHelper.accessor("sku", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SKU" />
    ),
    enableSorting: true,
    meta: { displayName: "SKU" },
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { displayName: "Name" },
  }),
  columnHelper.accessor("price", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "Price" },
  }),
  columnHelper.accessor("points", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Points" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "Points" },
  }),
  columnHelper.accessor("sparkid", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Spark ID" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "Spark ID" },
  }),
  columnHelper.accessor("reward", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reward" />
    ),
    cell: ({ getValue }) => display(getValue()),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "Reward" },
  }),
] as ColumnDef<PackageRead>[];
