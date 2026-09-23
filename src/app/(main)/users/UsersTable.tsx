"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { deleteUserAction } from "./actions";
import { UserColumnActions, getUserColumns } from "./columns";
import { UserFormDialog } from "./UserFormDialog";
import type { UserRead } from "./types";

const toolbarOptions = {
  search: {
    columnId: "email",
    placeholder: "Search users...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function UsersTable({ users }: { users: UserRead[] }) {
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<UserRead>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [isDeleting, startDeleteTransition] = useTransition();

  function deleteUser(user: UserRead) {
    if (!window.confirm(`Delete user “${user.email}”?`)) return;
    setError(undefined);
    startDeleteTransition(() => {
      void (async () => {
        const result = await deleteUserAction(user.id);
        if (!result.ok) return setError(result.error);
        router.refresh();
      })();
    });
  }

  const toolbar = {
    ...toolbarOptions,
    primaryAction: {
      label: "Add user",
      onClick: () => setIsCreateOpen(true),
    },
  } satisfies DataTableToolbarConfig;

  const columnActions: UserColumnActions = {
    onEdit: setEditingUser,
    onDelete: deleteUser,
  };

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {users.length} user{users.length === 1 ? "" : "s"}
        </p>
      </div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <DataTable
        columns={getUserColumns(columnActions)}
        data={users}
        emptyMessage="No users found."
        enableRowSelection
        getRowId={(user) => String(user.id)}
        pageSize={20}
        toolbar={toolbar}
      />
      <UserFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
      <UserFormDialog
        mode="edit"
        user={editingUser}
        open={editingUser !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditingUser(undefined);
        }}
      />
      {isDeleting && (
        <span className="sr-only" role="status">
          Deleting user
        </span>
      )}
    </>
  );
}
