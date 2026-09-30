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
import type { UserRead } from "./types";

type DetailField = [keyof UserRead, string];

const detailSections: { title: string; fields: DetailField[] }[] = [
  {
    title: "Identity and profile",
    fields: [
      ["email", "Email"],
      ["firstname", "First name"],
      ["lastname", "Last name"],
      ["airline", "Airline"],
      ["position", "Position"],
      ["createdate", "Created"],
    ],
  },
  {
    title: "Preferences and notifications",
    fields: [
      ["language", "Language"],
      ["currency", "Currency"],
      ["timezone", "Timezone"],
      ["newsletter", "Newsletter"],
      ["smsnotification", "SMS notifications"],
      ["rateus", "Rate us"],
    ],
  },
  {
    title: "Referrals and integrations",
    fields: [
      ["referralcode", "Referral code"],
      ["referredby", "Referred by"],
      ["stripeid", "Stripe ID"],
      ["logtoid", "Logto ID"],
    ],
  },
];

function displayDetail(value: UserRead[keyof UserRead]) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value ?? "—";
}

type UserDetailsDialogProps = {
  user: UserRead | undefined;
  onEdit: (user: UserRead) => void;
  onOpenChange: (open: boolean) => void;
};

export function UserDetailsDialog({
  user,
  onEdit,
  onOpenChange,
}: UserDetailsDialogProps) {
  return (
    <Dialog open={user !== undefined} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        {user && (
          <>
            <DialogHeader>
              <DialogTitle>User {user.id}</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6">
                {user.email}
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
                          {displayDetail(user[key])}
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
                onClick={() => onEdit(user)}
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
