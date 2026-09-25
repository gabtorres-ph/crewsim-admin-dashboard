"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

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
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { createTimezoneAction } from "./actions";

type TimezoneFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TimezoneFormDialog({
  open,
  onOpenChange,
}: TimezoneFormDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setName("");
    setError(undefined);
  }, [open]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();

    if (!normalizedName || normalizedName.length > 255) {
      setError("Name must contain between 1 and 255 characters.");
      return;
    }

    setError(undefined);
    startTransition(() => {
      void (async () => {
        const result = await createTimezoneAction({ name: normalizedName });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onOpenChange(false);
        router.refresh();
      })();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add timezone</DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6">
              Create a timezone in the Core API.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5">
            <Label htmlFor="timezone-name" className="font-medium">
              Name
            </Label>
            <Input
              id="timezone-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={255}
              placeholder="e.g. Asia/Manila"
              className="mt-2"
              autoFocus
              disabled={isPending}
              required
            />
          </div>
          {error && (
            <p
              role="alert"
              className="mt-4 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" isLoading={isPending} loadingText="Saving">
              Add timezone
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
