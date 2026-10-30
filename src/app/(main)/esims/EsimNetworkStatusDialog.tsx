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
import { Textarea } from "@/components/Textarea";
import { getNetworkStatusHistoryAction } from "./actions";
import type { EsimRead, NetworkStatusRecord } from "./types";

type HistoryState =
  | { status: "loading" }
  | { status: "loaded"; records: NetworkStatusRecord[] }
  | { status: "error"; message: string };

function formatHistory(records: NetworkStatusRecord[]): string {
  if (records.length === 0) return "No network status history found.";

  return records
    .map((record, index) =>
      [
        `${index + 1}. ${record.status}`,
        `Start: ${record.start}`,
        `End: ${record.end ?? "Ongoing"}`,
        `Profile type: ${record.profile_type}`,
        `Status modification: ${record.status_modification}`,
        `Record ID: ${record.id}`,
        `SIM ID: ${record.sim_id}`,
        `IMSI: ${record.imsi}`,
      ].join("\n"),
    )
    .join("\n\n");
}

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

  const textareaValue =
    history.status === "loading"
      ? "Loading network status history…"
      : history.status === "error"
        ? `Could not load network status history.\n\n${history.message}`
        : formatHistory(history.records);

  return (
    <Dialog open={esim !== undefined} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {esim && (
          <>
            <DialogHeader>
              <DialogTitle>Network Status</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6">
                Stored history for IMSI {esim.imsi}, newest first.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              className="mt-6 min-h-80 resize-none font-mono"
              aria-label={`Network status history for IMSI ${esim.imsi}`}
              aria-busy={history.status === "loading"}
              readOnly
              value={textareaValue}
            />
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
