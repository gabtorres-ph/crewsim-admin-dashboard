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
import type { EsimRead } from "./types";

type DetailField = [keyof EsimRead, string];

const detailSections: { title: string; fields: DetailField[] }[] = [
  {
    title: "Identity",
    fields: [
      ["createdate", "Created"],
      ["imsi", "IMSI"],
      ["name", "Name"],
      ["user_id", "User ID"],
      ["account_id", "Account ID"],
    ],
  },
  {
    title: "Provisioning",
    fields: [
      ["isesim", "Is eSIM"],
      ["smdpserver", "SM-DP+ server"],
      ["activationcode", "Activation code"],
      ["token", "Token"],
    ],
  },
  {
    title: "Device and service",
    fields: [
      ["imei", "IMEI"],
      ["imei_device", "IMEI device"],
      ["networkstatus", "Network status"],
      ["balance", "Balance"],
      ["allow_data", "Allow data"],
      ["use_account_for_charging", "Use account for charging"],
    ],
  },
];

function display(value: EsimRead[keyof EsimRead]) {
  if (value === null) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value;
}

type EsimDetailsDialogProps = {
  esim: EsimRead | undefined;
  onOpenChange: (open: boolean) => void;
};

export function EsimDetailsDialog({
  esim,
  onOpenChange,
}: EsimDetailsDialogProps) {
  return (
    <Dialog open={esim !== undefined} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        {esim && (
          <>
            <DialogHeader>
              <DialogTitle>eSIM {esim.id}</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6">
                {esim.name ?? esim.imsi}
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
                          {display(esim[key])}
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
