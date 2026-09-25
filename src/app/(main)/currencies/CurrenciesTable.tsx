"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { useState } from "react";
import { CurrencyFormDialog } from "./CurrencyFormDialog";
import { currencyColumns } from "./columns";
import type { CurrencyRead } from "./types";

const tableToolbar = {
  search: {
    columnId: "name",
    placeholder: "Search currencies...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function CurrenciesTable({
  currencies,
}: {
  currencies: CurrencyRead[];
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const toolbar = {
    ...tableToolbar,
    primaryAction: {
      label: "Add currency",
      onClick: () => setIsCreateOpen(true),
    },
  } satisfies DataTableToolbarConfig;

  return (
    <>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {currencies.length} currenc{currencies.length === 1 ? "y" : "ies"}
      </p>
      <DataTable
        columns={currencyColumns}
        data={currencies}
        emptyMessage="No currencies found."
        getRowId={(currency) => String(currency.id)}
        pageSize={20}
        toolbar={toolbar}
      />
      <CurrencyFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}
