"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { packageColumns } from "./columns";
import type { PackageRead } from "./types";

const toolbar = {
  search: {
    columnId: "sku",
    placeholder: "Search packages...",
  },
  showViewOptions: true,
} satisfies DataTableToolbarConfig;

export function PackagesTable({ packages }: { packages: PackageRead[] }) {
  return (
    <>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {packages.length} package{packages.length === 1 ? "" : "s"}
      </p>
      <DataTable
        columns={packageColumns}
        data={packages}
        emptyMessage="No packages found."
        getRowId={(item) => String(item.id)}
        pageSize={20}
        toolbar={toolbar}
      />
    </>
  );
}
