"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { useMemo, useState } from "react";
import { ApiLogDetailsDialog } from "./ApiLogDetailsDialog";
import { getApiLogColumns } from "./columns";
import type { RequestLogEntry } from "./types";

const tableToolbar = {
  search: {
    columnId: "path",
    placeholder: "Search API logs by path...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function ApiLogsTable({
  logs,
  total,
}: {
  logs: RequestLogEntry[];
  total: number;
}) {
  const [viewingLog, setViewingLog] = useState<RequestLogEntry>();
  const columns = useMemo(() => getApiLogColumns(setViewingLog), []);

  return (
    <>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {total > logs.length
          ? `Showing latest ${logs.length} of ${total.toLocaleString("en-US")} requests`
          : `${logs.length} request${logs.length === 1 ? "" : "s"}`}
      </p>
      <DataTable
        columns={columns}
        data={logs}
        emptyMessage="No API logs found."
        getRowId={(log) => log.request_id}
        pageSize={20}
        toolbar={tableToolbar}
      />
      <ApiLogDetailsDialog
        log={viewingLog}
        onOpenChange={(open) => {
          if (!open) setViewingLog(undefined);
        }}
      />
    </>
  );
}
