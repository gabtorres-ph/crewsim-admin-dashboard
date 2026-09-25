"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
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
import { createCrewAction } from "./actions";

type CrewFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function currentLocalDateTime(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function nullableNumber(value: string): number | null {
  const normalized = value.trim();
  return normalized ? Number(normalized) : null;
}

const emptyAdvancedFields = {
  file1: "",
  file2: "",
  file1Hash: "",
  file2Hash: "",
  reason: "",
  type: "",
  dhash: "",
  phash: "",
  dhashDistance: "",
  phashDistance: "",
};

export function CrewFormDialog({ open, onOpenChange }: CrewFormDialogProps) {
  const router = useRouter();
  const [uniqueId, setUniqueId] = useState("");
  const [isCrewId, setIsCrewId] = useState(false);
  const [createdate, setCreatedate] = useState(currentLocalDateTime);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [airline, setAirline] = useState("");
  const [userId, setUserId] = useState("");
  const [confidence, setConfidence] = useState("");
  const [advanced, setAdvanced] = useState(emptyAdvancedFields);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setUniqueId("");
    setIsCrewId(false);
    setCreatedate(currentLocalDateTime());
    setFirstname("");
    setLastname("");
    setAirline("");
    setUserId("");
    setConfidence("");
    setAdvanced(emptyAdvancedFields);
    setError(undefined);
  }, [open]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUniqueId = uniqueId.trim();
    const parsedUserId = nullableNumber(userId);
    const parsedDhashDistance = nullableNumber(advanced.dhashDistance);
    const parsedPhashDistance = nullableNumber(advanced.phashDistance);

    if (!normalizedUniqueId) {
      setError("Unique ID is required.");
      return;
    }
    if (!createdate || Number.isNaN(Date.parse(createdate))) {
      setError("Created date must be valid.");
      return;
    }
    if (
      parsedUserId !== null &&
      (!Number.isInteger(parsedUserId) || parsedUserId <= 0)
    ) {
      setError("User ID must be a positive whole number.");
      return;
    }
    if (
      (parsedDhashDistance !== null &&
        !Number.isInteger(parsedDhashDistance)) ||
      (parsedPhashDistance !== null && !Number.isInteger(parsedPhashDistance))
    ) {
      setError("Hash distances must be whole numbers.");
      return;
    }

    setError(undefined);
    startTransition(() => {
      void (async () => {
        const result = await createCrewAction({
          unique_id: normalizedUniqueId,
          iscrewid: isCrewId,
          createdate: new Date(createdate).toISOString(),
          firstname: firstname.trim() || null,
          lastname: lastname.trim() || null,
          airline: airline.trim() || null,
          user_id: parsedUserId,
          confidence: confidence.trim() || null,
          file1: advanced.file1.trim() || null,
          file2: advanced.file2.trim() || null,
          file1_hash: advanced.file1Hash.trim() || null,
          file2_hash: advanced.file2Hash.trim() || null,
          reason: advanced.reason.trim() || null,
          type: advanced.type.trim() || null,
          dhash: advanced.dhash.trim() || null,
          phash: advanced.phash.trim() || null,
          dhash_distance: parsedDhashDistance,
          phash_distance: parsedPhashDistance,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add crew member</DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6">
              Create a crew record in the Core API.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="crew-unique-id" className="font-medium">
                Unique ID
              </Label>
              <Input
                id="crew-unique-id"
                value={uniqueId}
                onChange={(event) => setUniqueId(event.target.value)}
                maxLength={50}
                className="mt-2"
                autoFocus
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="crew-createdate" className="font-medium">
                Created date
              </Label>
              <Input
                id="crew-createdate"
                type="datetime-local"
                value={createdate}
                onChange={(event) => setCreatedate(event.target.value)}
                className="mt-2"
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="crew-firstname" className="font-medium">
                First name
              </Label>
              <Input
                id="crew-firstname"
                value={firstname}
                onChange={(event) => setFirstname(event.target.value)}
                maxLength={150}
                className="mt-2"
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="crew-lastname" className="font-medium">
                Last name
              </Label>
              <Input
                id="crew-lastname"
                value={lastname}
                onChange={(event) => setLastname(event.target.value)}
                maxLength={150}
                className="mt-2"
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="crew-airline" className="font-medium">
                Airline
              </Label>
              <Input
                id="crew-airline"
                value={airline}
                onChange={(event) => setAirline(event.target.value)}
                maxLength={150}
                className="mt-2"
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="crew-user-id" className="font-medium">
                User ID
              </Label>
              <Input
                id="crew-user-id"
                type="number"
                min="1"
                step="1"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                className="mt-2"
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="crew-confidence" className="font-medium">
                Confidence
              </Label>
              <Input
                id="crew-confidence"
                inputMode="decimal"
                value={confidence}
                onChange={(event) => setConfidence(event.target.value)}
                placeholder="Optional decimal"
                className="mt-2"
                disabled={isPending}
              />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <Checkbox
                id="crew-is-id"
                checked={isCrewId}
                onCheckedChange={(checked) => setIsCrewId(checked === true)}
                disabled={isPending}
              />
              <Label htmlFor="crew-is-id" className="font-medium">
                Crew ID verified
              </Label>
            </div>
          </div>
          <details className="mt-5 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-50">
              Advanced matching metadata
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                ["file1", "File 1", "text"],
                ["file2", "File 2", "text"],
                ["file1Hash", "File 1 hash", "text"],
                ["file2Hash", "File 2 hash", "text"],
                ["reason", "Reason", "text"],
                ["type", "Type", "text"],
                ["dhash", "DHash", "text"],
                ["phash", "PHash", "text"],
                ["dhashDistance", "DHash distance", "number"],
                ["phashDistance", "PHash distance", "number"],
              ].map(([field, label, type]) => (
                <div key={field}>
                  <Label htmlFor={`crew-${field}`} className="font-medium">
                    {label}
                  </Label>
                  <Input
                    id={`crew-${field}`}
                    type={type}
                    step={type === "number" ? "1" : undefined}
                    value={advanced[field as keyof typeof advanced]}
                    onChange={(event) =>
                      setAdvanced((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    className="mt-2"
                    disabled={isPending}
                  />
                </div>
              ))}
            </div>
          </details>
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
              Add crew member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
