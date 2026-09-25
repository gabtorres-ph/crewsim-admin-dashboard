"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { languageColumns } from "./columns";
import type { LanguageRead } from "./types";

const toolbar = {
  search: {
    columnId: "name",
    placeholder: "Search languages...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function LanguagesTable({ languages }: { languages: LanguageRead[] }) {
  return (
    <>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {languages.length} language{languages.length === 1 ? "" : "s"}
      </p>
      <DataTable
        columns={languageColumns}
        data={languages}
        emptyMessage="No languages found."
        getRowId={(language) => String(language.id)}
        pageSize={20}
        toolbar={toolbar}
      />
    </>
  );
}
