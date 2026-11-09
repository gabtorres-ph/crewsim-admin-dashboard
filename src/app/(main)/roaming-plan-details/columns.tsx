"use client";

import { Badge } from "@/components/Badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/DataTableColumnHeader";
import {
  createColumnHelper,
  type ColumnDef,
  type HeaderContext,
} from "@tanstack/react-table";
import type { RoamingPlanDetailRead } from "./types";

const columnHelper = createColumnHelper<RoamingPlanDetailRead>();

function header(title: string) {
  return function ColumnHeader<TValue>({
    column,
  }: HeaderContext<RoamingPlanDetailRead, TValue>) {
    return <DataTableColumnHeader column={column} title={title} />;
  };
}

function formatStartDate(value: string): string {
  return value.replace("T", " ");
}

export const roamingPlanDetailColumns = [
  columnHelper.accessor("roaming_plan_rule_id", {
    header: header("Rule ID"),
    enableSorting: false,
    meta: { className: "tabular-nums", displayName: "Rule ID" },
  }),
  columnHelper.accessor("roaming_plan_id", {
    header: header("Roaming plan ID"),
    enableSorting: false,
    meta: { className: "tabular-nums", displayName: "Roaming plan ID" },
  }),
  columnHelper.accessor("network_id", {
    header: header("Network ID"),
    enableSorting: false,
    meta: { className: "tabular-nums", displayName: "Network ID" },
  }),
  columnHelper.accessor("continent", {
    header: header("Continent"),
    enableSorting: false,
    meta: { displayName: "Continent" },
  }),
  columnHelper.accessor("country_name", {
    header: header("Country"),
    enableSorting: false,
    meta: { displayName: "Country" },
  }),
  columnHelper.accessor("country_iso2", {
    header: header("ISO2"),
    cell: ({ getValue }) => getValue().toUpperCase(),
    enableSorting: false,
    meta: { className: "font-mono", displayName: "ISO2" },
  }),
  columnHelper.accessor("operator_name", {
    header: header("Operator"),
    enableSorting: false,
    meta: { displayName: "Operator" },
  }),
  columnHelper.accessor("mcc_mncs", {
    header: header("MCC/MNC"),
    cell: ({ getValue }) =>
      getValue()
        .map(({ mcc, mnc }) => `${mcc}/${mnc}`)
        .join(", ") || "—",
    enableSorting: false,
    meta: { className: "font-mono tabular-nums", displayName: "MCC/MNC" },
  }),
  columnHelper.accessor("tadigs", {
    header: header("TADIGs"),
    cell: ({ getValue }) => getValue().join(", ") || "—",
    enableSorting: false,
    meta: { className: "font-mono", displayName: "TADIGs" },
  }),
  columnHelper.accessor("active", {
    header: header("Status"),
    cell: ({ getValue }) => (
      <Badge variant={getValue() ? "success" : "neutral"}>
        {getValue() ? "Active" : "Inactive"}
      </Badge>
    ),
    enableSorting: false,
    meta: { displayName: "Status" },
  }),
  columnHelper.accessor("data_rate", {
    header: header("Data rate"),
    cell: ({ getValue }) => getValue() ?? "—",
    enableSorting: false,
    meta: { className: "font-mono tabular-nums", displayName: "Data rate" },
  }),
  columnHelper.accessor("start_date", {
    header: header("Start date"),
    cell: ({ getValue }) => formatStartDate(getValue()),
    enableSorting: false,
    meta: { className: "tabular-nums", displayName: "Start date" },
  }),
] as ColumnDef<RoamingPlanDetailRead>[];
