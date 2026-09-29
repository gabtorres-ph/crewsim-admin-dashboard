"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { CrewDetailsDialog } from "./CrewDetailsDialog";
import { CrewFormDialog } from "./CrewFormDialog";
import { deleteCrewAction } from "./actions";
import { getCrewColumns } from "./columns";
import type { CrewRead } from "./types";

const tableToolbar = {
  search: {
    columnId: "unique_id",
    placeholder: "Search crew...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function CrewTable({ crew }: { crew: CrewRead[] }) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewRead>();
  const [viewingCrew, setViewingCrew] = useState<CrewRead>();
  const [actionError, setActionError] = useState<string>();
  const [isDeleting, startDeleteTransition] = useTransition();

  const toolbar = {
    ...tableToolbar,
    primaryAction: {
      label: "Add crew member",
      onClick: () => {
        setEditingCrew(undefined);
        setIsFormOpen(true);
      },
    },
  } satisfies DataTableToolbarConfig;

  const columns = useMemo(() => {
    function deleteCrewMember(member: CrewRead) {
      if (!window.confirm(`Delete crew member ${member.unique_id}?`)) return;

      setActionError(undefined);
      startDeleteTransition(() => {
        void (async () => {
          const result = await deleteCrewAction(member.id);
          if (!result.ok) {
            setActionError(result.error);
            return;
          }
          router.refresh();
        })();
      });
    }

    return getCrewColumns({
      onView: setViewingCrew,
      onEdit: (member) => {
        setEditingCrew(member);
        setIsFormOpen(true);
      },
      onDelete: deleteCrewMember,
    });
  }, [router]);

  return (
    <>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {crew.length} crew member{crew.length === 1 ? "" : "s"}
      </p>
      {actionError && (
        <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
          {actionError}
        </p>
      )}
      <DataTable
        columns={columns}
        data={crew}
        emptyMessage="No crew members found."
        enableRowSelection
        getRowId={(member) => String(member.id)}
        pageSize={20}
        toolbar={toolbar}
      />
      <CrewFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        crew={editingCrew}
      />
      <CrewDetailsDialog
        crew={viewingCrew}
        onOpenChange={(open) => {
          if (!open) setViewingCrew(undefined);
        }}
      />
      {isDeleting && (
        <span className="sr-only" role="status">
          Deleting crew member
        </span>
      )}
    </>
  );
}
