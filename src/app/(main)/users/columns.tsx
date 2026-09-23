"use client";

import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import { RiDeleteBinLine, RiEditLine } from "@remixicon/react";
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
        <div className="flex justify-start gap-1">
          <Button
            type="button"
            variant="ghost"
            className="p-1.5"
            aria-label={`Edit ${row.original.email}`}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(row.original);
            }}
          >
            <RiEditLine className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400"
            aria-label={`Delete ${row.original.email}`}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(row.original);
            }}
          >
            <RiDeleteBinLine className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ),
      meta: { className: "text-left", displayName: "Actions" },
    }),
  ] as ColumnDef<UserRead>[];
}
