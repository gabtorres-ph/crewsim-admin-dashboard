"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { DataTable } from "@/components/ui/data-table/DataTable";
import type { DataTableToolbarConfig } from "@/components/ui/data-table/DataTableFilterbar";
import { deleteSimNotificationAction } from "./actions";
import { getSimNotificationColumns } from "./columns";
import { SimNotificationDetailsDialog } from "./SimNotificationDetailsDialog";
import type { SimNotificationRead, SimNotificationType } from "./types";

const BASE_PATH = "/sim_notification";
const toolbar = { showViewOptions: true } satisfies DataTableToolbarConfig;

function getPageUrl(offset: number, typ?: SimNotificationType, imsi?: string) {
  const params = new URLSearchParams();
  if (offset > 0) params.set("offset", String(offset));
  if (typ) params.set("typ", typ);
  if (imsi) params.set("imsi", imsi);
  const query = params.toString();
  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

export function SimNotificationsTable({
  notifications,
  hasNextPage,
  offset,
  pageSize,
  typ,
  imsi,
  queryError,
}: {
  notifications: SimNotificationRead[];
  hasNextPage: boolean;
  offset: number;
  pageSize: number;
  typ?: SimNotificationType;
  imsi: string;
  queryError?: string;
}) {
  const router = useRouter();
  const [viewingId, setViewingId] = useState<number>();
  const [error, setError] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterError, setFilterError] = useState<string>();

  const removeNotification = useCallback(
    async (notification: SimNotificationRead) => {
      if (isDeleting) return;
      if (!window.confirm(`Delete SIM notification ${notification.id}?`)) return;

      setError(undefined);
      setIsDeleting(true);
      try {
        const result = await deleteSimNotificationAction(notification.id);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        if (notifications.length === 1 && offset > 0) {
          router.push(getPageUrl(Math.max(0, offset - pageSize), typ, imsi));
        } else {
          router.refresh();
        }
      } catch {
        setError("The SIM notification could not be deleted.");
      } finally {
        setIsDeleting(false);
      }
    },
    [imsi, isDeleting, notifications.length, offset, pageSize, router, typ],
  );

  const columns = useMemo(
    () =>
      getSimNotificationColumns(
        (notification) => setViewingId(notification.id),
        (notification) => void removeNotification(notification),
      ),
    [removeNotification],
  );

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextType = String(formData.get("typ") ?? "") as SimNotificationType | "";
    const nextImsi = String(formData.get("imsi") ?? "").trim();
    if (nextImsi && !/^\d{5,15}$/.test(nextImsi)) {
      setFilterError("IMSI must contain 5 to 15 digits.");
      return;
    }

    setFilterError(undefined);
    router.push(getPageUrl(0, nextType || undefined, nextImsi));
  }

  const firstRow = notifications.length === 0 ? 0 : offset + 1;
  const lastRow = offset + notifications.length;
  const countLabel = `${notifications.length} notification${notifications.length === 1 ? "" : "s"} on this page`;

  return (
    <>
      <form
        onSubmit={applyFilters}
        className="mb-4 flex flex-col gap-3 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-end dark:border-gray-800"
      >
        <div className="w-full sm:max-w-xs">
          <label htmlFor="sim-notification-imsi" className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
            IMSI
          </label>
          <input
            id="sim-notification-imsi"
            name="imsi"
            type="search"
            inputMode="numeric"
            pattern="[0-9]{5,15}"
            minLength={5}
            maxLength={15}
            placeholder="Filter by IMSI"
            defaultValue={imsi}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
          />
        </div>
        <div className="w-full sm:max-w-xs">
          <label htmlFor="sim-notification-type" className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
            Type
          </label>
          <select
            id="sim-notification-type"
            name="typ"
            defaultValue={typ ?? ""}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
          >
            <option value="">All types</option>
            <option value="location">Location</option>
            <option value="ES2">ES2</option>
            <option value="package">Package</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="secondary">Apply filters</Button>
          {(typ || imsi) && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(BASE_PATH)}
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      {(queryError || filterError || error) && (
        <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
          {queryError ?? filterError ?? error}
        </p>
      )}
      {isDeleting && (
        <span className="sr-only" role="status">
          Deleting SIM notification
        </span>
      )}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
        <p>{countLabel}</p>
        {(typ || imsi) && (
          <div className="flex items-center gap-2">
            {typ && <Badge variant="neutral">{typ}</Badge>}
            {imsi && <Badge variant="neutral">IMSI {imsi}</Badge>}
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={notifications}
        emptyMessage={queryError ? "Correct the filters to load notifications." : "No SIM notifications found."}
        getRowId={(notification) => String(notification.id)}
        pageSize={pageSize}
        showPagination={false}
        toolbar={toolbar}
      />

      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm tabular-nums text-gray-500 dark:text-gray-400" aria-live="polite">
          {notifications.length > 0 ? `Showing ${firstRow}–${lastRow}` : "No rows"}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={offset === 0}
            onClick={() => router.push(getPageUrl(Math.max(0, offset - pageSize), typ, imsi))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!hasNextPage}
            onClick={() => router.push(getPageUrl(offset + pageSize, typ, imsi))}
          >
            Next
          </Button>
        </div>
      </div>

      <SimNotificationDetailsDialog
        notificationId={viewingId}
        onOpenChange={(open) => {
          if (!open) setViewingId(undefined);
        }}
      />
    </>
  );
}
