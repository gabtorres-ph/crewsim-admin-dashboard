"use client"

import { columns } from "@/components/ui/data-table/columns"
import { DataTable } from "@/components/ui/data-table/DataTable"
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar"
import { conditions, regions, statuses, usage } from "@/data/data"
import { formatters } from "@/lib/utils"

const toolbar = {
  search: {
    columnId: "owner",
    placeholder: "Search by owner...",
  },
  filters: [
    {
      columnId: "status",
      title: "Status",
      options: statuses,
      type: "select",
    },
    {
      columnId: "region",
      title: "Region",
      options: regions,
      type: "checkbox",
    },
    {
      columnId: "costs",
      title: "Costs",
      options: conditions,
      type: "number",
      formatter: (value) => formatters.currency(Number(value)),
      inputPlaceholder: "$0",
    },
  ],
  showViewOptions: true,
} satisfies DataTableToolbarConfig

export function DetailsTable() {
  return (
    <DataTable
      columns={columns}
      data={usage}
      enableRowSelection
      toolbar={toolbar}
    />
  )
}
