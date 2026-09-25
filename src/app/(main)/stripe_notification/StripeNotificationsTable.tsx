"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { stripeNotificationColumns } from "./columns";
import type { StripeNotificationRead } from "./types";

const toolbar = {
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
  return (
    <>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {notifications.length} notification
        {notifications.length === 1 ? "" : "s"}
      </p>
      <DataTable
        columns={stripeNotificationColumns}
        data={notifications}
        emptyMessage="No Stripe notifications found."
        getRowId={(notification) => String(notification.id)}
        pageSize={20}
        toolbar={toolbar}
      />
    </>
  );
}
