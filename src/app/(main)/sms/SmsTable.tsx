"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { useState } from "react";
import { SmsFormDialog } from "./SmsFormDialog";
import { smsColumns } from "./columns";
import type { SmsRead } from "./types";

const tableToolbar = {
  search: {
    columnId: "sms_text",
    placeholder: "Search SMS messages...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function SmsTable({ messages }: { messages: SmsRead[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const toolbar = {
    ...tableToolbar,
    primaryAction: {
      label: "Add SMS",
      onClick: () => setIsCreateOpen(true),
    },
  } satisfies DataTableToolbarConfig;

  return (
    <>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {messages.length} message{messages.length === 1 ? "" : "s"}
      </p>
      <DataTable
        columns={smsColumns}
        data={messages}
        emptyMessage="No SMS messages found."
        getRowId={(message) => String(message.id)}
        pageSize={20}
        toolbar={toolbar}
      />
      <SmsFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}
