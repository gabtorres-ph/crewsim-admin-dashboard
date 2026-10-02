"use client";

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
import { display } from "./columns";
import type { StripeNotificationRead } from "./types";

type DetailField = [keyof StripeNotificationRead, string];

const detailSections: { title: string; fields: DetailField[] }[] = [
  {
    title: "Event",
    fields: [
      ["createdate", "Created"],
      ["eventid", "Event ID"],
      ["invoiceid", "Invoice ID"],
      ["customerid", "Customer ID"],
      ["userid", "User ID"],
      ["state", "State"],
    ],
  },
  {
    title: "Transaction",
    fields: [
      ["sku", "SKU"],
      ["currency", "Currency"],
      ["amount_net", "Net amount"],
      ["amount_tax", "Tax amount"],
      ["amount_gross", "Gross amount"],
      ["amount_credit", "Credit amount"],
    ],
  },
  {
    title: "Tax and subscriber",
    fields: [
      ["taxrate", "Tax rate"],
      ["taxcountry", "Tax country"],
      ["imsi", "IMSI"],
    ],
  },
];

type StripeNotificationDetailsDialogProps = {
  notification: StripeNotificationRead | undefined;
  onOpenChange: (open: boolean) => void;
};

export function StripeNotificationDetailsDialog({
  notification,
  onOpenChange,
}: StripeNotificationDetailsDialogProps) {
  return (
    <Dialog open={notification !== undefined} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        {notification && (
          <>
            <DialogHeader>
              <DialogTitle>Stripe notification {notification.id}</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6">
                Event {notification.eventid}
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
                          {display(notification[key])}
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
