"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { useMemo, useState } from "react";
import { SmsDetailsDialog } from "./SmsDetailsDialog";
import { getSmsColumns } from "./columns";
import type { SmsRead } from "./types";

const tableToolbar = {
  search: {
    columnId: "sms_text",
    placeholder: "Search SMS messages...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function SmsTable({ messages }: { messages: SmsRead[] }) {
  const [viewingMessage, setViewingMessage] = useState<SmsRead>();
  const columns = useMemo(() => getSmsColumns(setViewingMessage), []);

  return (
    <>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {messages.length} message{messages.length === 1 ? "" : "s"}
      </p>
      <DataTable
        columns={columns}
        data={messages}
        emptyMessage="No SMS messages found."
        getRowId={(message) => String(message.id)}
        pageSize={20}
        toolbar={tableToolbar}
      />
      <SmsDetailsDialog
        message={viewingMessage}
        onOpenChange={(open) => {
          if (!open) setViewingMessage(undefined);
        }}
      />
    </>
  );
}
