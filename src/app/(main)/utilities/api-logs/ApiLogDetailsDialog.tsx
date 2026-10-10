"use client";

import { useEffect, useState } from "react";

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
import { getRequestLogAction } from "./actions";
import { display, formatTimestamp } from "./columns";
import type { RequestLogEntry } from "./types";

type DetailField = [keyof RequestLogEntry, string];

const detailSections: { title: string; fields: DetailField[] }[] = [
  {
    title: "Request",
    fields: [
      ["request_id", "Request ID"],
      ["method", "Method"],
      ["path", "Path"],
      ["user_id", "User ID"],
      ["caller_ip", "Caller IP"],
      ["content_type", "Content type"],
      ["req_body_len", "Body size (bytes)"],
      ["req_body_truncated", "Body truncated"],
      ["req_body_gzip", "Body gzipped"],
    ],
  },
  {
    title: "Response",
    fields: [
      ["status", "Status"],
      ["duration_ms", "Duration (ms)"],
      ["resp_content_type", "Content type"],
      ["resp_body_len", "Body size (bytes)"],
      ["resp_body_truncated", "Body truncated"],
      ["resp_body_gzip", "Body gzipped"],
    ],
  },
];

type ApiLogDetailsDialogProps = {
  log: RequestLogEntry | undefined;
  onOpenChange: (open: boolean) => void;
};

type ResponseBodyResult = { requestId: string } & (
  | { status: "loaded"; body: unknown }
  | { status: "error"; error: string }
);

function formatResponseBody(body: unknown, contentType: string | null): string {
  if (typeof body !== "string") return JSON.stringify(body, null, 2);
  if (!contentType?.toLowerCase().includes("json")) return body;
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

export function ApiLogDetailsDialog({
  log,
  onOpenChange,
}: ApiLogDetailsDialogProps) {
  const requestId = log?.request_id;
  const [bodyResult, setBodyResult] = useState<ResponseBodyResult>();
  const responseBody =
    bodyResult?.requestId === requestId ? bodyResult : { status: "loading" };

  useEffect(() => {
    if (!requestId) return;
    let ignore = false;

    getRequestLogAction(requestId)
      .then((result) => {
        if (ignore) return;
        setBodyResult(
          result.ok
            ? { requestId, status: "loaded", body: result.log.response_body }
            : { requestId, status: "error", error: result.error },
        );
      })
      .catch(() => {
        if (ignore) return;
        setBodyResult({
          requestId,
          status: "error",
          error: "The response body could not be loaded.",
        });
      });

    return () => {
      ignore = true;
    };
  }, [requestId]);

  return (
    <Dialog open={log !== undefined} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        {log && (
          <>
            <DialogHeader>
              <DialogTitle>
                {log.method} {log.path}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6">
                {formatTimestamp(log.ts)}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 space-y-6">
              {detailSections.map((section) => (
                <section key={section.title}>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {section.title}
                  </h3>
                  <dl className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {section.fields.map(([key, label]) => (
                      <div key={key} className="min-w-0">
                        <dt className="text-xs text-gray-500 dark:text-gray-400">
                          {label}
                        </dt>
                        <dd className="mt-0.5 break-words text-sm text-gray-900 dark:text-gray-50">
                          {display(log[key])}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button
                  type="button"
                  className="w-full sm:w-fit"
                  variant="secondary"
                >
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
