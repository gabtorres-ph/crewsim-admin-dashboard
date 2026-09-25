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
import { createPackageAction } from "./actions";

type PackageFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function nullableNumber(value: string): number | null {
  const normalized = value.trim();
  return normalized ? Number(normalized) : null;
}

function nullableInteger(value: string): number | null {
  const parsed = nullableNumber(value);
  if (parsed !== null && !Number.isInteger(parsed))
    throw new Error("must be a whole number");
  return parsed;
}

export function PackageFormDialog({
  open,
  onOpenChange,
}: PackageFormDialogProps) {
  const router = useRouter();
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [points, setPoints] = useState("");
  const [sparkid, setSparkid] = useState("");
  const [reward, setReward] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setSku("");
    setName("");
    setPrice("");
    setPoints("");
    setSparkid("");
    setReward("");
    setError(undefined);
  }, [open]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSku = sku.trim();
    if (!normalizedSku) {
      setError("SKU is required.");
      return;
    }

    let values: {
      price: number | null;
      points: number | null;
      sparkid: number | null;
      reward: number | null;
    };
    try {
      values = {
        price: nullableNumber(price),
        points: nullableInteger(points),
        sparkid: nullableInteger(sparkid),
        reward: nullableInteger(reward),
      };
      if (values.price !== null && !Number.isFinite(values.price))
        throw new Error("Price must be a valid number.");
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : "Enter valid numeric values.",
      );
      return;
    }

    setError(undefined);
    startTransition(() => {
      void (async () => {
        const result = await createPackageAction({
          sku: normalizedSku,
          name: name.trim() || null,
          ...values,
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
    ["package-name", "Name", name, setName, "text", "Optional"],
    ["package-price", "Price", price, setPrice, "number", "Optional"],
    ["package-points", "Points", points, setPoints, "number", "Optional"],
    ["package-sparkid", "Spark ID", sparkid, setSparkid, "number", "Optional"],
    ["package-reward", "Reward", reward, setReward, "number", "Optional"],
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add package</DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6">
              Create a package template in the Core API.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="package-sku" className="font-medium">
                SKU
              </Label>
              <Input
                id="package-sku"
                value={sku}
                onChange={(event) => setSku(event.target.value)}
                maxLength={255}
                className="mt-2"
                autoFocus
                disabled={isPending}
                required
              />
            </div>
            {fields.map(([id, label, value, setter, type, placeholder]) => (
              <div key={id}>
                <Label htmlFor={id} className="font-medium">
                  {label}
                </Label>
                <Input
                  id={id}
                  type={type}
                  step={type === "number" ? "any" : undefined}
                  value={value}
                  onChange={(event) => setter(event.target.value)}
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
              Add package
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
