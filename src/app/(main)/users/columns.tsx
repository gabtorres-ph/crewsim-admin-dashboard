"use client";

import { Checkbox } from "@/components/Checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/ui/data-table/DataTableRowActions";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { UserRead } from "./types";

const columnHelper = createColumnHelper<UserRead>();

export type UserColumnActions = {
  onEdit: (user: UserRead) => void;
  onDelete: (user: UserRead) => void;
};

export function getUserColumns({ onEdit, onDelete }: UserColumnActions) {
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
          aria-label="Select all users"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={() => row.toggleSelected()}
          className="translate-y-0.5"
          aria-label={`Select ${row.original.email}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { displayName: "Select" },
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: { className: "text-left", displayName: "Email" },
    }),
    columnHelper.accessor(
      (user) => [user.firstname, user.lastname].filter(Boolean).join(" "),
      {
        id: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        enableSorting: true,
        meta: { className: "text-left", displayName: "Name" },
        cell: ({ getValue }) => getValue<string>() || "—",
      },
    ),
    columnHelper.accessor("language", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Language" />
      ),
      enableSorting: true,
      meta: { className: "text-left", displayName: "Language" },
    }),
    columnHelper.accessor("currency", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Currency" />
      ),
      enableSorting: true,
      meta: { className: "text-left", displayName: "Currency" },
    }),
    columnHelper.accessor("timezone", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Timezone" />
      ),
      enableSorting: true,
      meta: { className: "text-left", displayName: "Timezone" },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          rowLabel={row.original.email}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
      meta: { className: "text-left", displayName: "Actions" },
    }),
  ] as ColumnDef<UserRead>[];
}
