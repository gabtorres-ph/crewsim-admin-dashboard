"use client";

import { useEffect, useState } from "react";
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
import { createStripeNotificationAction } from "./actions";
import type { StripeNotificationCreate } from "./types";

type StripeNotificationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type StripeFormValues = {
  [Field in keyof StripeNotificationCreate]-?: string;
};

function currentLocalDateTime(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function getInitialValues(): StripeFormValues {
  return {
    eventid: "",
    invoiceid: "",
    customerid: "",
    taxrate: "",
    taxcountry: "",
    amount_net: "",
    amount_tax: "",
    amount_gross: "",
    currency: "",
    sku: "",
    userid: "",
    state: "",
    createdate: currentLocalDateTime(),
    imsi: "",
    amount_credit: "",
  };
}

function decimalValue(value: string, label: string): string {
  const normalized = value.trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    throw new Error(`${label} must be a valid decimal number.`);
  }
  const unsigned = normalized.replace(/^[+-]/, "");
  const [integerPart, fractionalPart = ""] = unsigned.split(".");
  const integerDigits = integerPart.replace(/^0+/, "").length;
  if (integerDigits + fractionalPart.length > 10 || fractionalPart.length > 2) {
    throw new Error(
      `${label} must have at most 10 digits and 2 decimal places.`,
    );
  }
  return normalized;
}

function optionalDecimal(value: string, label: string): string | null {
  return value.trim() ? decimalValue(value, label) : null;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
        {title}
      </legend>
      <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </fieldset>
  );
}

export function StripeNotificationFormDialog({
  open,
  onOpenChange,
}: StripeNotificationFormDialogProps) {
  const router = useRouter();
  const [values, setValues] = useState<StripeFormValues>(getInitialValues);
  const [error, setError] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(getInitialValues());
    setError(undefined);
  }, [open]);

  function updateValue(field: keyof StripeFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function textField(
    field: keyof StripeFormValues,
    label: string,
    options: {
      required?: boolean;
      placeholder?: string;
      inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
      autoFocus?: boolean;
    } = {},
  ) {
    return (
      <div key={field}>
        <Label htmlFor={`stripe-${field}`} className="font-medium">
          {label}
        </Label>
        <Input
          id={`stripe-${field}`}
          value={values[field]}
          onChange={(event) => updateValue(field, event.target.value)}
          maxLength={100}
          placeholder={options.placeholder}
          inputMode={options.inputMode}
          className="mt-2"
          disabled={isPending}
          required={options.required}
          autoFocus={options.autoFocus}
        />
      </div>
    );
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const requiredTextFields = [
      ["eventid", "Event ID"],
      ["invoiceid", "Invoice ID"],
      ["customerid", "Customer ID"],
      ["currency", "Currency"],
      ["sku", "SKU"],
    ] as const;
    const emptyField = requiredTextFields.find(
      ([field]) => !values[field].trim(),
    );
    if (emptyField) {
      setError(`${emptyField[1]} is required.`);
      return;
    }

    const userId = Number(values.userid);
    if (!values.userid.trim() || !Number.isInteger(userId) || userId <= 0) {
      setError("User ID must be a positive whole number.");
      return;
    }

    const createdDate = new Date(values.createdate);
    if (!values.createdate || Number.isNaN(createdDate.getTime())) {
      setError("Created date must be valid.");
      return;
    }

    let decimalValues: Pick<
      StripeNotificationCreate,
      "amount_net" | "amount_tax" | "amount_gross" | "taxrate" | "amount_credit"
    >;
    try {
      decimalValues = {
        amount_net: decimalValue(values.amount_net, "Net amount"),
        amount_tax: decimalValue(values.amount_tax, "Tax amount"),
        amount_gross: decimalValue(values.amount_gross, "Gross amount"),
        taxrate: optionalDecimal(values.taxrate, "Tax rate"),
        amount_credit: optionalDecimal(values.amount_credit, "Credit amount"),
      };
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : "Enter valid decimal values.",
      );
      return;
    }

    setError(undefined);
    setIsPending(true);
    void (async () => {
      try {
        const result = await createStripeNotificationAction({
          eventid: values.eventid.trim(),
          invoiceid: values.invoiceid.trim(),
          customerid: values.customerid.trim(),
          taxcountry: values.taxcountry.trim() || null,
          currency: values.currency.trim(),
          sku: values.sku.trim(),
          userid: userId,
          state: values.state.trim() || null,
          createdate: createdDate.toISOString(),
          imsi: values.imsi.trim() || null,
          ...decimalValues,
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onOpenChange(false);
        router.refresh();
      } finally {
        setIsPending(false);
      }
    })();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-4xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add Stripe notification</DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6">
              Create a Stripe notification in the Core API. Dates are saved in
              UTC.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 space-y-5">
            <Section title="Event">
              {textField("eventid", "Event ID", {
                required: true,
                autoFocus: true,
              })}
              {textField("invoiceid", "Invoice ID", { required: true })}
              {textField("customerid", "Customer ID", { required: true })}
              <div>
                <Label htmlFor="stripe-userid" className="font-medium">
                  User ID
                </Label>
                <Input
                  id="stripe-userid"
                  type="number"
                  min="1"
                  step="1"
                  value={values.userid}
                  onChange={(event) =>
                    updateValue("userid", event.target.value)
                  }
                  className="mt-2"
                  disabled={isPending}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stripe-createdate" className="font-medium">
                  Created date
                </Label>
                <Input
                  id="stripe-createdate"
                  type="datetime-local"
                  value={values.createdate}
                  onChange={(event) =>
                    updateValue("createdate", event.target.value)
                  }
                  className="mt-2"
                  disabled={isPending}
                  required
                />
              </div>
              {textField("state", "State", { placeholder: "Optional" })}
            </Section>
            <Section title="Transaction">
              {textField("sku", "SKU", { required: true })}
              {textField("currency", "Currency", { required: true })}
              {textField("amount_net", "Net amount", {
                required: true,
                inputMode: "decimal",
              })}
              {textField("amount_tax", "Tax amount", {
                required: true,
                inputMode: "decimal",
              })}
              {textField("amount_gross", "Gross amount", {
                required: true,
                inputMode: "decimal",
              })}
              {textField("amount_credit", "Credit amount", {
                placeholder: "Optional",
                inputMode: "decimal",
              })}
              {textField("taxrate", "Tax rate", {
                placeholder: "Optional",
                inputMode: "decimal",
              })}
              {textField("taxcountry", "Tax country", {
                placeholder: "Optional",
              })}
            </Section>
            <Section title="Subscriber">
              {textField("imsi", "IMSI", { placeholder: "Optional" })}
            </Section>
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
              Add Stripe notification
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
