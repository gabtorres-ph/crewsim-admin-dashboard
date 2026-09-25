"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { useState } from "react";
import { TimezoneFormDialog } from "./TimezoneFormDialog";
import { timezoneColumns } from "./columns";
import type { TimezoneRead } from "./types";

const tableToolbar = {
  search: {
    columnId: "name",
    placeholder: "Search timezones...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function TimezonesTable({ timezones }: { timezones: TimezoneRead[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const toolbar = {
    ...tableToolbar,
    primaryAction: {
      label: "Add timezone",
      onClick: () => setIsCreateOpen(true),
    },
  } satisfies DataTableToolbarConfig;

  return (
    <>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {timezones.length} timezone{timezones.length === 1 ? "" : "s"}
      </p>
      <DataTable
        columns={timezoneColumns}
        data={timezones}
        emptyMessage="No timezones found."
        getRowId={(timezone) => timezone.name}
        pageSize={20}
        toolbar={toolbar}
      />
      <TimezoneFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}
