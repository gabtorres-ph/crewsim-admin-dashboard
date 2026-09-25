"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { crewColumns } from "./columns";
import type { CrewRead } from "./types";

const toolbar = {
  search: {
    columnId: "unique_id",
    placeholder: "Search crew...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function CrewTable({ crew }: { crew: CrewRead[] }) {
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
    </>
  );
}
