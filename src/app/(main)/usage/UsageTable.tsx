"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { usageColumns } from "./columns";
import type { UsageRead } from "./types";

const toolbar = {
  search: {
    columnId: "session_id",
    placeholder: "Search usage records...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function UsageTable({ usage }: { usage: UsageRead[] }) {
  return (
    <>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {usage.length} usage record{usage.length === 1 ? "" : "s"}
      </p>
      <DataTable
        columns={usageColumns}
        data={usage}
        emptyMessage="No usage records found."
        getRowId={(record) => String(record.id)}
        pageSize={20}
        toolbar={toolbar}
      />
    </>
  );
}
