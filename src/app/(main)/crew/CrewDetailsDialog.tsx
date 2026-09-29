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
import type { CrewRead } from "./types";

type DetailField = [keyof CrewRead, string];

const detailSections: { title: string; fields: DetailField[] }[] = [
  {
    title: "Identity",
    fields: [
      ["unique_id", "Unique ID"],
      ["firstname", "First name"],
      ["lastname", "Last name"],
      ["airline", "Airline"],
      ["user_id", "User ID"],
      ["createdate", "Created"],
    ],
  },
  {
    title: "Verification",
    fields: [
      ["iscrewid", "Crew ID verified"],
      ["confidence", "Confidence"],
      ["type", "Type"],
      ["reason", "Reason"],
    ],
  },
  {
    title: "Files",
    fields: [
      ["file1", "File 1"],
      ["file1_hash", "File 1 hash"],
      ["file2", "File 2"],
      ["file2_hash", "File 2 hash"],
    ],
  },
  {
    title: "Image matching",
    fields: [
      ["dhash", "DHash"],
      ["dhash_distance", "DHash distance"],
      ["phash", "PHash"],
      ["phash_distance", "PHash distance"],
    ],
  },
];

function displayDetail(value: CrewRead[keyof CrewRead]) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return display(value);
}

type CrewDetailsDialogProps = {
  crew: CrewRead | undefined;
  onOpenChange: (open: boolean) => void;
};

export function CrewDetailsDialog({
  crew,
  onOpenChange,
}: CrewDetailsDialogProps) {
  const fullName = [crew?.firstname, crew?.lastname].filter(Boolean).join(" ");

  return (
    <Dialog open={crew !== undefined} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        {crew && (
          <>
            <DialogHeader>
              <DialogTitle>Crew member {crew.id}</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6">
                {fullName || crew.unique_id}
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
                          {displayDetail(crew[key])}
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
