"use client";

import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { TimezoneRead } from "./types";

const columnHelper = createColumnHelper<TimezoneRead>();

export const timezoneColumns = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    enableSorting: true,
    meta: { displayName: "Name" },
  }),
] as ColumnDef<TimezoneRead>[];
