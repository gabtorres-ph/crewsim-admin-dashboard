"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { useState } from "react";
import { CrewFormDialog } from "./CrewFormDialog";
import { crewColumns } from "./columns";
import type { CrewRead } from "./types";

const tableToolbar = {
  search: {
    columnId: "unique_id",
    placeholder: "Search crew...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function CrewTable({ crew }: { crew: CrewRead[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const toolbar = {
    ...tableToolbar,
    primaryAction: {
      label: "Add crew member",
      onClick: () => setIsCreateOpen(true),
    },
  } satisfies DataTableToolbarConfig;

  return (
    <>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {crew.length} crew member{crew.length === 1 ? "" : "s"}
      </p>
      <DataTable
        columns={crewColumns}
        data={crew}
        emptyMessage="No crew members found."
        getRowId={(member) => String(member.id)}
        pageSize={20}
        toolbar={toolbar}
      />
      <CrewFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}
