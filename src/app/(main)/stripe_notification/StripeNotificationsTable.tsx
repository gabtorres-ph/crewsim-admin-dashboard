"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { useMemo, useState } from "react";
import { StripeNotificationDetailsDialog } from "./StripeNotificationDetailsDialog";
import { getStripeNotificationColumns } from "./columns";
import type { StripeNotificationRead } from "./types";

const tableToolbar = {
  search: {
    columnId: "eventid",
    placeholder: "Search Stripe notifications...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function StripeNotificationsTable({
  notifications,
}: {
  notifications: StripeNotificationRead[];
}) {
  const [viewingNotification, setViewingNotification] =
    useState<StripeNotificationRead>();
  const columns = useMemo(
    () => getStripeNotificationColumns(setViewingNotification),
    [],
  );

  return (
    <>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {notifications.length} notification
        {notifications.length === 1 ? "" : "s"}
      </p>
      <DataTable
        columns={columns}
        data={notifications}
        emptyMessage="No Stripe notifications found."
        getRowId={(notification) => String(notification.id)}
        pageSize={20}
        toolbar={tableToolbar}
      />
      <StripeNotificationDetailsDialog
        notification={viewingNotification}
        onOpenChange={(open) => {
          if (!open) setViewingNotification(undefined);
        }}
      />
    </>
  );
}
