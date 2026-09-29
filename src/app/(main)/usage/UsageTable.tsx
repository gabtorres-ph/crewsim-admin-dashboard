"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { UsageDetailsDialog } from "./UsageDetailsDialog";
import { deleteUsageAction } from "./actions";
import { getUsageColumns } from "./columns";
import type { UsageRead } from "./types";

const tableToolbar = {
  search: {
    columnId: "session_id",
    placeholder: "Search usage records...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function UsageTable({ usage }: { usage: UsageRead[] }) {
  const router = useRouter();
  const [viewingUsage, setViewingUsage] = useState<UsageRead>();
  const [actionError, setActionError] = useState<string>();
  const [isDeleting, startDeleteTransition] = useTransition();

  const toolbar = {
    ...tableToolbar,
    primaryAction: {
      label: "Add usage record",
      onClick: () => router.push("/usage/new"),
    },
  } satisfies DataTableToolbarConfig;

  const columns = useMemo(() => {
    function deleteUsage(record: UsageRead) {
      if (!window.confirm(`Delete usage record ${record.id}?`)) return;

      setActionError(undefined);
      startDeleteTransition(() => {
        void (async () => {
          const result = await deleteUsageAction(record.id);
          if (!result.ok) {
            setActionError(result.error);
            return;
          }
          router.refresh();
        })();
      });
    }

    return getUsageColumns({
      onView: setViewingUsage,
      onEdit: (record) => router.push(`/usage/${record.id}/edit`),
      onDelete: deleteUsage,
    });
  }, [router]);

  return (
    <>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {usage.length} usage record{usage.length === 1 ? "" : "s"}
      </p>
      {actionError && (
        <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
          {actionError}
        </p>
      )}
      <DataTable
        columns={columns}
        data={usage}
        emptyMessage="No usage records found."
        getRowId={(record) => String(record.id)}
        pageSize={20}
        toolbar={toolbar}
      />
      <UsageDetailsDialog
        usage={viewingUsage}
        onOpenChange={(open) => {
          if (!open) setViewingUsage(undefined);
        }}
      />
      {isDeleting && (
        <span className="sr-only" role="status">
          Deleting usage record
        </span>
      )}
    </>
  );
}
