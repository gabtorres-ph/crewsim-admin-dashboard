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

function decimalParts(value: string) {
  const isNegative = value.startsWith("-");
  const [whole, fraction = ""] = (isNegative ? value.slice(1) : value).split(
    ".",
  );
  const coefficient =
    BigInt(`${whole}${fraction}`) * BigInt(isNegative ? -1 : 1);
  return { coefficient, scale: fraction.length };
}

function decimalScalePower(exponent: number): bigint {
  let value = BigInt(1);
  for (let index = 0; index < exponent; index += 1) value *= BigInt(10);
  return value;
}

function compareDecimalStrings(
  left: string | null,
  right: string | null,
): number {
  if (left === null) return right === null ? 0 : 1;
  if (right === null) return -1;

  const leftParts = decimalParts(left);
  const rightParts = decimalParts(right);
  const scale = Math.max(leftParts.scale, rightParts.scale);
  const leftValue =
    leftParts.coefficient * decimalScalePower(scale - leftParts.scale);
  const rightValue =
    rightParts.coefficient * decimalScalePower(scale - rightParts.scale);
  return leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
}

export const roamingPlanDetailColumns = [
  columnHelper.accessor("roaming_plan_rule_id", {
    header: header("Rule ID"),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "Rule ID" },
  }),
  columnHelper.accessor("roaming_plan_id", {
    header: header("Roaming plan ID"),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "Roaming plan ID" },
  }),
  columnHelper.accessor("network_id", {
    header: header("Network ID"),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "Network ID" },
  }),
  columnHelper.accessor("continent", {
    header: header("Continent"),
    enableSorting: true,
    meta: { displayName: "Continent" },
  }),
  columnHelper.accessor("country_name", {
    header: header("Country"),
    enableSorting: true,
    meta: { displayName: "Country" },
  }),
  columnHelper.accessor("country_iso2", {
    header: header("ISO2"),
    cell: ({ getValue }) => getValue().toUpperCase(),
    enableSorting: true,
    meta: { className: "font-mono", displayName: "ISO2" },
  }),
  columnHelper.accessor("operator_name", {
    header: header("Operator"),
    enableSorting: true,
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
    enableSorting: true,
    meta: { displayName: "Status" },
  }),
  columnHelper.accessor("data_rate", {
    header: header("Data rate"),
    cell: ({ getValue }) => getValue() ?? "—",
    sortingFn: (left, right) =>
      compareDecimalStrings(left.original.data_rate, right.original.data_rate),
    enableSorting: true,
    meta: { className: "font-mono tabular-nums", displayName: "Data rate" },
  }),
  columnHelper.accessor("start_date", {
    header: header("Start date"),
    cell: ({ getValue }) => formatStartDate(getValue()),
    enableSorting: true,
    meta: { className: "tabular-nums", displayName: "Start date" },
  }),
] as ColumnDef<RoamingPlanDetailRead>[];
