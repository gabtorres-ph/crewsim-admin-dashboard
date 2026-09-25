"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { useState } from "react";
import { StripeNotificationFormDialog } from "./StripeNotificationFormDialog";
import { stripeNotificationColumns } from "./columns";
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const toolbar = {
    ...tableToolbar,
    primaryAction: {
      label: "Add Stripe notification",
      onClick: () => setIsCreateOpen(true),
    },
  } satisfies DataTableToolbarConfig;

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
      <StripeNotificationFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </>
  );
}
