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
import { createCurrencyAction } from "./actions";

type CurrencyFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function requiredInteger(
  value: string,
  label: string,
  minimum: number,
  maximum?: number,
): number {
  const normalized = value.trim();
  const parsed = Number(normalized);
  if (
    !normalized ||
    !Number.isInteger(parsed) ||
    parsed < minimum ||
    (maximum !== undefined && parsed > maximum)
  ) {
    const range =
      maximum === undefined
        ? `${minimum} or greater`
        : `between ${minimum} and ${maximum}`;
    throw new Error(`${label} must be a whole number ${range}.`);
  }
  return parsed;
}

export function CurrencyFormDialog({
  open,
  onOpenChange,
}: CurrencyFormDialogProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [nativeSymbol, setNativeSymbol] = useState("");
  const [decimalDigits, setDecimalDigits] = useState("");
  const [rounding, setRounding] = useState("");
  const [isoNumeric, setIsoNumeric] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setCode("");
    setName("");
    setSymbol("");
    setNativeSymbol("");
    setDecimalDigits("");
    setRounding("");
    setIsoNumeric("");
    setError(undefined);
  }, [open]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = code.trim();
    const normalizedName = name.trim();
    const normalizedSymbol = symbol.trim();
    const normalizedNativeSymbol = nativeSymbol.trim();

    if (normalizedCode.length !== 3) {
      setError("Code must contain exactly 3 characters.");
      return;
    }
    if (!normalizedName || normalizedName.length > 100) {
      setError("Name must contain between 1 and 100 characters.");
      return;
    }
    if (!normalizedSymbol || normalizedSymbol.length > 10) {
      setError("Symbol must contain between 1 and 10 characters.");
      return;
    }
    if (!normalizedNativeSymbol || normalizedNativeSymbol.length > 10) {
      setError("Native symbol must contain between 1 and 10 characters.");
      return;
    }

    let numericValues: {
      decimal_digits: number;
      rounding: number;
      iso_numeric: number;
    };
    try {
      numericValues = {
        decimal_digits: requiredInteger(decimalDigits, "Decimal digits", 0),
        rounding: requiredInteger(rounding, "Rounding", 0),
        iso_numeric: requiredInteger(isoNumeric, "ISO numeric", 1, 999),
      };
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
        const result = await createCurrencyAction({
          code: normalizedCode,
          name: normalizedName,
          symbol: normalizedSymbol,
          symbol_native: normalizedNativeSymbol,
          ...numericValues,
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
            <DialogTitle>Add currency</DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6">
              Create a currency and its ISO details in the Core API.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="currency-code" className="font-medium">
                Code
              </Label>
              <Input
                id="currency-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                minLength={3}
                maxLength={3}
                placeholder="e.g. USD"
                className="mt-2"
                autoFocus
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency-name" className="font-medium">
                Name
              </Label>
              <Input
                id="currency-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                className="mt-2"
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency-symbol" className="font-medium">
                Symbol
              </Label>
              <Input
                id="currency-symbol"
                value={symbol}
                onChange={(event) => setSymbol(event.target.value)}
                maxLength={10}
                className="mt-2"
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency-native-symbol" className="font-medium">
                Native symbol
              </Label>
              <Input
                id="currency-native-symbol"
                value={nativeSymbol}
                onChange={(event) => setNativeSymbol(event.target.value)}
                maxLength={10}
                className="mt-2"
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency-decimal-digits" className="font-medium">
                Decimal digits
              </Label>
              <Input
                id="currency-decimal-digits"
                type="number"
                min={0}
                step={1}
                value={decimalDigits}
                onChange={(event) => setDecimalDigits(event.target.value)}
                className="mt-2"
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency-rounding" className="font-medium">
                Rounding
              </Label>
              <Input
                id="currency-rounding"
                type="number"
                min={0}
                step={1}
                value={rounding}
                onChange={(event) => setRounding(event.target.value)}
                className="mt-2"
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency-iso-numeric" className="font-medium">
                ISO numeric
              </Label>
              <Input
                id="currency-iso-numeric"
                type="number"
                min={1}
                max={999}
                step={1}
                value={isoNumeric}
                onChange={(event) => setIsoNumeric(event.target.value)}
                className="mt-2"
                disabled={isPending}
                required
              />
            </div>
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
              Add currency
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
