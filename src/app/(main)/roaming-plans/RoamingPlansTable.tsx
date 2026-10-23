"use client";

import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { refreshRoamingPlansAction } from "./actions";
import { roamingPlanColumns } from "./columns";
import type { RoamingPlanRead } from "./types";

export function RoamingPlansTable({ plans }: { plans: RoamingPlanRead[] }) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string>();
  const [summary, setSummary] = useState<string>();

  async function handleRefresh() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setError(undefined);
    setSummary(undefined);

    try {
      const result = await refreshRoamingPlansAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }

      const { fetched, created, updated, unchanged } = result.summary;
      setSummary(
        `Refreshed: ${fetched} fetched, ${created} created, ${updated} updated, ${unchanged} unchanged.`,
      );
      router.refresh();
    } catch {
      setError("The roaming plan refresh failed. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }

  const toolbar = {
    search: {
      columnId: "roaming_plan_name",
      placeholder: "Search roaming plans...",
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
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {plans.length} roaming plan{plans.length === 1 ? "" : "s"}
      </p>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {summary && (
        <p role="status" className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {summary}
        </p>
      )}
      <DataTable
        columns={roamingPlanColumns}
        data={plans}
        emptyMessage="No roaming plans found."
        getRowId={(plan) => String(plan.id)}
        pageSize={20}
        toolbar={toolbar}
      />
    </>
  );
}
