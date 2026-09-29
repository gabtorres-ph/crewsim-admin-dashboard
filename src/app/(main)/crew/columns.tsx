"use client";

import { Checkbox } from "@/components/Checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/ui/data-table/DataTableRowActions";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { CrewRead } from "./types";

const columnHelper = createColumnHelper<CrewRead>();
export const display = (value: string | number | null | undefined) =>
  value ?? "—";

export type CrewColumnActions = {
  onView: (crew: CrewRead) => void;
  onEdit: (crew: CrewRead) => void;
  onDelete: (crew: CrewRead) => void;
};

export function getCrewColumns({
  onView,
  onEdit,
  onDelete,
}: CrewColumnActions) {
  return [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomeRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={() => table.toggleAllPageRowsSelected()}
          className="translate-y-0.5"
          aria-label="Select all crew members"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={() => row.toggleSelected()}
          className="translate-y-0.5"
          aria-label={`Select crew member ${row.original.unique_id}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { displayName: "Select" },
    }),
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
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          rowLabel={`crew member ${row.original.unique_id}`}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
      meta: { displayName: "Actions" },
    }),
  ] as ColumnDef<CrewRead>[];
}
