"use client";

import { useRouter } from "next/navigation";

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
import type { UsageRead } from "./types";

type DetailField = [keyof UsageRead, string];

const detailSections: { title: string; fields: DetailField[] }[] = [
  {
    title: "Event and session",
    fields: [
      ["usage_date_utc", "Usage date (UTC)"],
      ["session_id", "Session ID"],
      ["usage_type_id", "Usage type ID"],
      ["usage_type", "Usage type"],
      ["total_qty", "Total quantity"],
      ["toll_free", "Toll-free"],
    ],
  },
  {
    title: "Network usage",
    fields: [
      ["mcc", "MCC"],
      ["mnc", "MNC"],
      ["apn", "APN"],
      ["rat", "RAT"],
      ["down_bitrate", "Down bitrate"],
      ["up_bitrate", "Up bitrate"],
    ],
  },
  {
    title: "Subscriber and customer",
    fields: [
      ["subs_reseller_name", "Subscriber reseller name"],
      ["subs_account_name", "Subscriber account name"],
      ["subs_account_id", "Subscriber account ID"],
      ["subscriber_id", "Subscriber ID"],
      ["subs_phone_number", "Subscriber phone number"],
      ["custo_account_name", "Customer account name"],
      ["custo_account_id", "Customer account ID"],
      ["dest_phone_number", "Destination phone number"],
    ],
  },
  {
    title: "Package and charges",
    fields: [
      ["prepaid_package_ids", "Prepaid package IDs"],
      ["prepaid_package_qtys", "Prepaid package quantities"],
      ["custo_charge", "Customer charge"],
      ["subs_charge", "Subscriber charge"],
    ],
  },
  {
    title: "Device and source",
    fields: [
      ["imsi", "IMSI"],
      ["iccid", "ICCID"],
      ["imei", "IMEI"],
      ["filename", "Filename"],
    ],
  },
];

type UsageDetailsDialogProps = {
  usage: UsageRead | undefined;
  onOpenChange: (open: boolean) => void;
};

export function UsageDetailsDialog({
  usage,
  onOpenChange,
}: UsageDetailsDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={usage !== undefined} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        {usage && (
          <>
            <DialogHeader>
              <DialogTitle>Usage record {usage.id}</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6">
                Session {usage.session_id}
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
                          {display(usage[key])}
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
                  className="mt-2 w-full sm:mt-0 sm:w-fit"
                  variant="secondary"
                >
                  Close
                </Button>
              </DialogClose>
              <Button
                type="button"
                className="w-full sm:w-fit"
                onClick={() => router.push(`/usage/${usage.id}/edit`)}
              >
                Edit
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
