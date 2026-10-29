"use client";

import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { refreshRoamingPlanDetailsAction } from "./actions";
import { roamingPlanDetailColumns } from "./columns";
import type { RoamingPlanDetailRead } from "./types";

export function RoamingPlanDetailsTable({
  details,
}: {
  details: RoamingPlanDetailRead[];
}) {
  const router = useRouter();
  const [tariffId, setTariffId] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string>();
  const [summary, setSummary] = useState<string>();

  async function handleRefresh() {
    if (isRefreshing) return;

    const normalizedTariffId = tariffId.trim();
    const parsedTariffId =
      normalizedTariffId === "" ? undefined : Number(normalizedTariffId);
    if (
      parsedTariffId !== undefined &&
      (!Number.isInteger(parsedTariffId) || parsedTariffId < 1)
    ) {
      setError("Customer tariff ID must be blank or a positive integer.");
      setSummary(undefined);
      return;
    }

    setIsRefreshing(true);
    setError(undefined);
    setSummary(undefined);

    try {
      const result = await refreshRoamingPlanDetailsAction(parsedTariffId);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSummary(
        parsedTariffId === undefined
          ? "Roaming plan details refreshed."
          : `Roaming plan details refreshed for customer tariff ${parsedTariffId}.`,
      );
      router.refresh();
    } catch {
      setError("The roaming plan details refresh failed. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }

  const toolbar = {
    search: {
      columnId: "operator_name",
      placeholder: "Search operators...",
    },
    showViewOptions: true,
    primaryAction: {
      label: "Refresh",
      onClick: handleRefresh,
      loading: isRefreshing,
    },
  } satisfies DataTableToolbarConfig;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {details.length} roaming plan detail{details.length === 1 ? "" : "s"}
        </p>
        <div className="w-full sm:w-48">
          <Label htmlFor="roaming-plan-details-tariff-id">
            Customer tariff ID (optional)
          </Label>
          <Input
            id="roaming-plan-details-tariff-id"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="Refresh all"
            value={tariffId}
            onChange={(event) => setTariffId(event.target.value)}
            disabled={isRefreshing}
            className="mt-2"
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {summary && (
        <p
          role="status"
          className="mb-4 text-sm text-gray-500 dark:text-gray-400"
        >
          {summary}
        </p>
      )}
      <DataTable
        columns={roamingPlanDetailColumns}
        data={details}
        emptyMessage="No roaming plan details found."
        getRowId={(detail) => String(detail.roaming_plan_rule_id)}
        pageSize={20}
        toolbar={toolbar}
      />
    </>
  );
}
