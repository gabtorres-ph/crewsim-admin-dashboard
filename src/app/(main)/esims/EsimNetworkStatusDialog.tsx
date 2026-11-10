"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { getNetworkStatusHistoryAction } from "./actions";
import { networkStatusColumns } from "./networkStatusColumns";
import type { EsimRead, NetworkStatusRecord } from "./types";

type HistoryState =
  | { status: "loading" }
  | { status: "loaded"; records: NetworkStatusRecord[] }
  | { status: "error"; message: string };

type EsimNetworkStatusDialogProps = {
  esim: EsimRead | undefined;
  reloadKey: number;
  onOpenChange: (open: boolean) => void;
};

export function EsimNetworkStatusDialog({
  esim,
  reloadKey,
  onOpenChange,
}: EsimNetworkStatusDialogProps) {
  const [history, setHistory] = useState<HistoryState>({ status: "loading" });
  const requestIdRef = useRef(0);

  const loadHistory = useCallback(async () => {
    if (!esim) return;

    const requestId = ++requestIdRef.current;
    setHistory({ status: "loading" });
    const result = await getNetworkStatusHistoryAction(esim.imsi);
    if (requestId !== requestIdRef.current) return;
    setHistory(
      result.ok
        ? { status: "loaded", records: result.records }
        : { status: "error", message: result.error },
    );
  }, [esim]);

  useEffect(() => {
    void loadHistory();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadHistory, reloadKey]);

  return (
    <Dialog open={esim !== undefined} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-6xl">
        {esim && (
          <>
            <DialogHeader>
              <DialogTitle>Network Status</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6">
                Stored history for IMSI {esim.imsi}, newest first.
              </DialogDescription>
            </DialogHeader>
            <div
              className="mt-6 min-w-0"
              aria-busy={history.status === "loading"}
            >
              {history.status === "loading" && (
                <p className="py-12 text-center text-sm text-gray-500">
                  Loading network status history…
                </p>
              )}

              {history.status === "error" && (
                <p
                  role="alert"
                  className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                >
                  Could not load network status history. {history.message}
                </p>
              )}

              {history.status === "loaded" && (
                <DataTable
                  columns={networkStatusColumns}
                  data={history.records}
                  getRowId={(record) => String(record.id)}
                  emptyMessage="No network status history found."
                  pageSize={10}
                />
              )}
            </div>
            <DialogFooter className="mt-6">
              {history.status === "error" && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void loadHistory()}
                >
                  Retry
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
