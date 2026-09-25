"use client";

import { useEffect, useState, useTransition } from "react";
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
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { createLanguageAction } from "./actions";

type LanguageFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function optionalCode(
  value: string,
  length: number,
  label: string,
): string | null {
  const normalized = value.trim();
  if (normalized && normalized.length !== length) {
    throw new Error(`${label} must contain exactly ${length} characters.`);
  }
  return normalized || null;
}

export function LanguageFormDialog({
  open,
  onOpenChange,
}: LanguageFormDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [iso1, setIso1] = useState("");
  const [iso2b, setIso2b] = useState("");
  const [iso2t, setIso2t] = useState("");
  const [iso3, setIso3] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setName("");
    setIso1("");
    setIso2b("");
    setIso2t("");
    setIso3("");
    setError(undefined);
  }, [open]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedIso3 = iso3.trim();

    if (!normalizedName || normalizedName.length > 150) {
      setError("Name must contain between 1 and 150 characters.");
      return;
    }
    if (normalizedIso3.length !== 3) {
      setError("ISO 639-3 must contain exactly 3 characters.");
      return;
    }

    let optionalValues: {
      iso1: string | null;
      iso2b: string | null;
      iso2t: string | null;
    };
    try {
      optionalValues = {
        iso1: optionalCode(iso1, 2, "ISO 639-1"),
        iso2b: optionalCode(iso2b, 3, "ISO 639-2/B"),
        iso2t: optionalCode(iso2t, 3, "ISO 639-2/T"),
      };
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : "Enter valid language codes.",
      );
      return;
    }

    setError(undefined);
    startTransition(() => {
      void (async () => {
        const result = await createLanguageAction({
          name: normalizedName,
          iso3: normalizedIso3,
          ...optionalValues,
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onOpenChange(false);
        router.refresh();
      })();
    });
  }

  const fields = [
    ["language-iso1", "ISO 639-1", iso1, setIso1, 2, "Optional"],
    ["language-iso2b", "ISO 639-2/B", iso2b, setIso2b, 3, "Optional"],
    ["language-iso2t", "ISO 639-2/T", iso2t, setIso2t, 3, "Optional"],
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add language</DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6">
              Create a language and its ISO codes in the Core API.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="language-name" className="font-medium">
                Name
              </Label>
              <Input
                id="language-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={150}
                className="mt-2"
                autoFocus
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="language-iso3" className="font-medium">
                ISO 639-3
              </Label>
              <Input
                id="language-iso3"
                value={iso3}
                onChange={(event) => setIso3(event.target.value)}
                minLength={3}
                maxLength={3}
                className="mt-2"
                disabled={isPending}
                required
              />
            </div>
            {fields.map(([id, label, value, setter, length, placeholder]) => (
              <div key={id}>
                <Label htmlFor={id} className="font-medium">
                  {label}
                </Label>
                <Input
                  id={id}
                  value={value}
                  onChange={(event) => setter(event.target.value)}
                  maxLength={length}
                  placeholder={placeholder}
                  className="mt-2"
                  disabled={isPending}
                />
              </div>
            ))}
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
              Add language
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
