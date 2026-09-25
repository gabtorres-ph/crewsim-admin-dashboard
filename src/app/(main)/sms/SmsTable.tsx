"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { smsColumns } from "./columns";
import type { SmsRead } from "./types";

const toolbar = {
  search: {
    columnId: "sms_text",
    placeholder: "Search SMS messages...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function SmsTable({ messages }: { messages: SmsRead[] }) {
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
    </>
  );
}
