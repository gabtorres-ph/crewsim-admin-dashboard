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
import { getSimNotificationAction } from "./actions";
import { formatCreatedAt } from "./columns";
import type { SimNotificationRead } from "./types";

type DetailResult =
  | { id: number; status: "loaded"; notification: SimNotificationRead }
  | { id: number; status: "error"; message: string };

export function SimNotificationDetailsDialog({
  notificationId,
  onOpenChange,
}: {
  notificationId: number | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const [result, setResult] = useState<DetailResult>();
  const currentResult =
    notificationId !== undefined && result?.id === notificationId
      ? result
      : undefined;

  useEffect(() => {
    if (notificationId === undefined) return;
    let ignore = false;

    getSimNotificationAction(notificationId)
      .then((response) => {
        if (ignore) return;
        setResult(
          response.ok
            ? { id: notificationId, status: "loaded", notification: response.value }
            : {
                id: notificationId,
                status: "error",
                message:
                  response.status === 404
                    ? "This notification no longer exists. Refresh the list and try again."
                    : response.error,
              },
        );
      })
      .catch(() => {
        if (!ignore) {
          setResult({
            id: notificationId,
            status: "error",
            message: "The notification details could not be loaded.",
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [notificationId]);

  const notification =
    currentResult?.status === "loaded" ? currentResult.notification : undefined;

  return (
    <Dialog open={notificationId !== undefined} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {notificationId !== undefined && (
          <>
            <DialogHeader>
              <DialogTitle>SIM notification {notificationId}</DialogTitle>
              <DialogDescription>
                {notification
                  ? `${notification.typ} notification from ${notification.provider}`
                  : "Notification details"}
              </DialogDescription>
            </DialogHeader>

            {!currentResult && (
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400" role="status">
                Loading notification details…
              </p>
            )}
            {currentResult?.status === "error" && (
              <p className="mt-6 text-sm text-red-600 dark:text-red-400" role="alert">
                {currentResult.message}
              </p>
            )}
            {notification && (
              <div className="mt-6 space-y-6">
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    Notification
                  </h3>
                  <dl className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {[
                      ["Created", formatCreatedAt(notification.createdate)],
                      ["Type", notification.typ],
                      ["IMSI", notification.imsi],
                      ["Provider", notification.provider],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
                        <dd className="mt-0.5 break-words text-sm text-gray-900 dark:text-gray-50">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    Provider payload
                  </h3>
                  <pre className="mt-2 max-h-[50vh] overflow-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-xs leading-5 text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
                    {JSON.stringify(notification.payload, null, 2)}
                  </pre>
                </section>
              </div>
            )}

            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" className="w-full sm:w-fit" variant="secondary">
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
