"use client";

import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { RoamingPlanRead } from "./types";

const columnHelper = createColumnHelper<RoamingPlanRead>();

export const roamingPlanColumns = [
  columnHelper.accessor("id", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "ID" },
  }),
  columnHelper.accessor("roaming_plan_name", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Roaming plan name" />,
    cell: ({ getValue }) => getValue() ?? "—",
    enableSorting: true,
    meta: { displayName: "Roaming plan name" },
  }),
] as ColumnDef<RoamingPlanRead>[];
