"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { createUsageAction, type UsageActionResult } from "./actions";
import type { UsageCreate } from "./types";

type UsageFormValues = Record<keyof UsageCreate, string>;

type UsageFormProps = {
  initialValues?: Partial<UsageFormValues>;
  submitAction?: (input: UsageCreate) => Promise<UsageActionResult>;
  submitLabel?: string;
  onSuccess?: () => void;
};

type TextFieldProps = {
  id: keyof UsageFormValues;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "datetime-local";
  required?: boolean;
  hint?: string;
  disabled: boolean;
};

function currentLocalDateTime(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function getInitialValues(): UsageFormValues {
  return {
    usage_date_utc: currentLocalDateTime(),
    session_id: "",
    mcc: "",
    mnc: "",
    total_qty: "",
    usage_type_id: "",
    usage_type: "",
    dest_phone_number: "",
    subs_reseller_name: "",
    custo_account_name: "",
    subs_account_name: "",
    subscriber_id: "",
    imsi: "",
    iccid: "",
    subs_phone_number: "",
    prepaid_package_ids: "",
    prepaid_package_qtys: "",
    toll_free: "",
    custo_account_id: "",
    custo_charge: "",
    subs_account_id: "",
    subs_charge: "",
    apn: "",
    rat: "",
    imei: "",
    down_bitrate: "",
    up_bitrate: "",
    filename: "",
  };
}

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  hint,
  disabled,
}: TextFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="font-medium">
        {label}
        {required ? " *" : ""}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        step={type === "number" ? "any" : undefined}
        className="mt-2"
        disabled={disabled}
      />
      {hint && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
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

function requiredInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!value.trim() || !Number.isInteger(parsed))
    throw new Error(`${label} must be a whole number.`);
  return parsed;
}

function nullableInteger(value: string, label: string): number | null {
  return value.trim() ? requiredInteger(value, label) : null;
}

export function UsageForm({
  initialValues,
  submitAction,
  submitLabel = "Add usage record",
  onSuccess,
}: UsageFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<UsageFormValues>(() => ({
    ...getInitialValues(),
    ...initialValues,
  }));
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const saveUsage = submitAction ?? createUsageAction;

  function updateValue(field: keyof UsageFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function field(
    field: keyof UsageFormValues,
    label: string,
    options: Omit<
      TextFieldProps,
      "id" | "label" | "value" | "onChange" | "disabled"
    > = {},
  ) {
    return (
      <TextField
        id={field}
        label={label}
        value={values[field]}
        onChange={(value) => updateValue(field, value)}
        disabled={isPending}
        {...options}
      />
    );
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const requiredTextFields: [keyof UsageFormValues, string][] = [
      ["session_id", "Session ID"],
      ["usage_type", "Usage type"],
      ["subs_reseller_name", "Subscriber reseller name"],
      ["custo_account_name", "Customer account name"],
      ["subs_account_name", "Subscriber account name"],
      ["imsi", "IMSI"],
      ["iccid", "ICCID"],
      ["subs_phone_number", "Subscriber phone number"],
      ["prepaid_package_ids", "Prepaid package IDs"],
      ["prepaid_package_qtys", "Prepaid package quantities"],
      ["toll_free", "Toll-free"],
      ["apn", "APN"],
      ["imei", "IMEI"],
      ["filename", "Filename"],
    ];
    const emptyField = requiredTextFields.find(([key]) => !values[key].trim());
    if (emptyField) {
      setError(`${emptyField[1]} is required.`);
      return;
    }

    const parsedDate = new Date(values.usage_date_utc);
    if (!values.usage_date_utc || Number.isNaN(parsedDate.getTime())) {
      setError("Usage date must be valid.");
      return;
    }

    let input: UsageCreate;
    try {
      input = {
        usage_date_utc: parsedDate.toISOString(),
        session_id: values.session_id.trim(),
        mcc: requiredInteger(values.mcc, "MCC"),
        mnc: requiredInteger(values.mnc, "MNC"),
        total_qty: requiredInteger(values.total_qty, "Total quantity"),
        usage_type_id: requiredInteger(values.usage_type_id, "Usage type ID"),
        usage_type: values.usage_type.trim(),
        dest_phone_number: values.dest_phone_number.trim() || null,
        subs_reseller_name: values.subs_reseller_name.trim(),
        custo_account_name: values.custo_account_name.trim(),
        subs_account_name: values.subs_account_name.trim(),
        subscriber_id: requiredInteger(values.subscriber_id, "Subscriber ID"),
        imsi: values.imsi.trim(),
        iccid: values.iccid.trim(),
        subs_phone_number: values.subs_phone_number.trim(),
        prepaid_package_ids: values.prepaid_package_ids.trim(),
        prepaid_package_qtys: values.prepaid_package_qtys.trim(),
        toll_free: values.toll_free.trim(),
        custo_account_id: nullableInteger(
          values.custo_account_id,
          "Customer account ID",
        ),
        custo_charge: values.custo_charge.trim() || null,
        subs_account_id: nullableInteger(
          values.subs_account_id,
          "Subscriber account ID",
        ),
        subs_charge: values.subs_charge.trim() || null,
        apn: values.apn.trim(),
        rat: requiredInteger(values.rat, "RAT"),
        imei: values.imei.trim(),
        down_bitrate: requiredInteger(values.down_bitrate, "Down bitrate"),
        up_bitrate: requiredInteger(values.up_bitrate, "Up bitrate"),
        filename: values.filename.trim(),
      };
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : "Enter valid values.",
      );
      return;
    }

    setError(undefined);
    startTransition(() => {
      void (async () => {
        const result = await saveUsage(input);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        if (onSuccess) {
          onSuccess();
          return;
        }
        router.push("/usage");
        router.refresh();
      })();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Fields marked with * are required by the Core API. The usage date is
        saved in UTC.
      </p>
      <Section title="Event and session">
        {field("usage_date_utc", "Usage date", {
          type: "datetime-local",
          required: true,
        })}
        {field("session_id", "Session ID", { required: true })}
        {field("usage_type_id", "Usage type ID", {
          type: "number",
          required: true,
        })}
        {field("usage_type", "Usage type", { required: true })}
        {field("total_qty", "Total quantity", {
          type: "number",
          required: true,
        })}
        {field("toll_free", "Toll-free", {
          required: true,
          hint: "Up to 10 characters.",
        })}
      </Section>
      <Section title="Network usage">
        {field("mcc", "MCC", { type: "number", required: true })}
        {field("mnc", "MNC", { type: "number", required: true })}
        {field("apn", "APN", { required: true })}
        {field("rat", "RAT", { type: "number", required: true })}
        {field("down_bitrate", "Down bitrate", {
          type: "number",
          required: true,
        })}
        {field("up_bitrate", "Up bitrate", { type: "number", required: true })}
      </Section>
      <Section title="Subscriber and customer">
        {field("subs_reseller_name", "Subscriber reseller name", {
          required: true,
        })}
        {field("subs_account_name", "Subscriber account name", {
          required: true,
        })}
        {field("subs_account_id", "Subscriber account ID", { type: "number" })}
        {field("subscriber_id", "Subscriber ID", {
          type: "number",
          required: true,
        })}
        {field("subs_phone_number", "Subscriber phone number", {
          required: true,
        })}
        {field("custo_account_name", "Customer account name", {
          required: true,
        })}
        {field("custo_account_id", "Customer account ID", { type: "number" })}
        {field("dest_phone_number", "Destination phone number")}
      </Section>
      <Section title="Package and charges">
        {field("prepaid_package_ids", "Prepaid package IDs", {
          required: true,
        })}
        {field("prepaid_package_qtys", "Prepaid package quantities", {
          required: true,
        })}
        {field("custo_charge", "Customer charge", {
          hint: "Optional decimal value.",
        })}
        {field("subs_charge", "Subscriber charge", {
          hint: "Optional decimal value.",
        })}
      </Section>
      <Section title="Device and source">
        {field("imsi", "IMSI", { required: true })}
        {field("iccid", "ICCID", { required: true })}
        {field("imei", "IMEI", { required: true })}
        {field("filename", "Filename", { required: true })}
      </Section>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/usage")}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending} loadingText="Saving">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
