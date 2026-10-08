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
import type { SmsRead } from "./types";

type DetailField = [keyof SmsRead, string];

const detailSections: { title: string; fields: DetailField[] }[] = [
  {
    title: "Message",
    fields: [
      ["created_at", "Created"],
      ["sender", "Sender"],
      ["imsi", "IMSI"],
      ["user_id", "User ID"],
      ["language", "Language"],
      ["template", "Template"],
      ["sms_text", "Message"],
    ],
  },
  {
    title: "Delivery",
    fields: [
      ["sent_at", "Sent"],
      ["sent_result_code", "Result code"],
      ["sent_result_text", "Result text"],
      ["retry_counter", "Retries"],
    ],
  },
];

const display = (value: SmsRead[keyof SmsRead]) => value ?? "—";

type SmsDetailsDialogProps = {
  message: SmsRead | undefined;
  onOpenChange: (open: boolean) => void;
};

export function SmsDetailsDialog({
  message,
  onOpenChange,
}: SmsDetailsDialogProps) {
  return (
    <Dialog open={message !== undefined} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        {message && (
          <>
            <DialogHeader>
              <DialogTitle>SMS message {message.id}</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6">
                From {message.sender} to {message.imsi}
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
                      <div
                        key={key}
                        className={
                          key === "sms_text"
                            ? "min-w-0 sm:col-span-2"
                            : "min-w-0"
                        }
                      >
                        <dt className="text-xs text-gray-500 dark:text-gray-400">
                          {label}
                        </dt>
                        <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm text-gray-900 dark:text-gray-50">
                          {display(message[key])}
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
