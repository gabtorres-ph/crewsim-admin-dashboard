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
import { Textarea } from "@/components/Textarea";
import { createSmsAction } from "./actions";

type SmsFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function currentLocalDateTime(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function toIsoDateTime(value: string, label: string): string {
  const parsed = new Date(value);
  if (!value || Number.isNaN(parsed.getTime())) {
    throw new Error(`${label} must be a valid date and time.`);
  }
  return parsed.toISOString();
}

function optionalDateTime(value: string, label: string): string | null {
  return value ? toIsoDateTime(value, label) : null;
}

function optionalInteger(value: string, label: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${label} must be a non-negative whole number.`);
  }
  return parsed;
}

export function SmsFormDialog({ open, onOpenChange }: SmsFormDialogProps) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [imsi, setImsi] = useState("");
  const [sender, setSender] = useState("");
  const [smsText, setSmsText] = useState("");
  const [template, setTemplate] = useState("");
  const [language, setLanguage] = useState("");
  const [createdAt, setCreatedAt] = useState(currentLocalDateTime);
  const [sentAt, setSentAt] = useState("");
  const [sentResultCode, setSentResultCode] = useState("");
  const [sentResultText, setSentResultText] = useState("");
  const [retryCounter, setRetryCounter] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setUserId("");
    setImsi("");
    setSender("");
    setSmsText("");
    setTemplate("");
    setLanguage("");
    setCreatedAt(currentLocalDateTime());
    setSentAt("");
    setSentResultCode("");
    setSentResultText("");
    setRetryCounter("");
    setError(undefined);
  }, [open]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedUserId = Number(userId);
    const normalizedImsi = imsi.trim();
    const normalizedSender = sender.trim();
    const normalizedSmsText = smsText.trim();
    const normalizedLanguage = language.trim();

    if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
      setError("User ID must be a positive whole number.");
      return;
    }
    if (!normalizedImsi || !normalizedSender || !normalizedSmsText) {
      setError("IMSI, sender, and message are required.");
      return;
    }
    if (normalizedLanguage.length !== 2) {
      setError("Language must contain exactly 2 characters.");
      return;
    }

    let dateValues: { createdAt: string; sentAt: string | null };
    let normalizedRetryCounter: number | null;
    try {
      dateValues = {
        createdAt: toIsoDateTime(createdAt, "Created date"),
        sentAt: optionalDateTime(sentAt, "Sent date"),
      };
      normalizedRetryCounter = optionalInteger(retryCounter, "Retry count");
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : "Enter valid SMS values.",
      );
      return;
    }

    setError(undefined);
    startTransition(() => {
      void (async () => {
        const result = await createSmsAction({
          user_id: normalizedUserId,
          imsi: normalizedImsi,
          sender: normalizedSender,
          sms_text: normalizedSmsText,
          template: template.trim() || null,
          language: normalizedLanguage,
          created_at: dateValues.createdAt,
          sent_at: dateValues.sentAt,
          sent_result_code: sentResultCode.trim() || null,
          sent_result_text: sentResultText.trim() || null,
          retry_counter: normalizedRetryCounter,
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
      <DialogContent className="max-h-[90vh] sm:max-w-3xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add SMS</DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6">
              Create an SMS record in the Core API. Dates are saved in UTC.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sms-user-id" className="font-medium">
                User ID
              </Label>
              <Input
                id="sms-user-id"
                type="number"
                min="1"
                step="1"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                className="mt-2"
                autoFocus
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="sms-imsi" className="font-medium">
                IMSI
              </Label>
              <Input
                id="sms-imsi"
                value={imsi}
                onChange={(event) => setImsi(event.target.value)}
                maxLength={100}
                className="mt-2"
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="sms-sender" className="font-medium">
                Sender
              </Label>
              <Input
                id="sms-sender"
                value={sender}
                onChange={(event) => setSender(event.target.value)}
                maxLength={100}
                className="mt-2"
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="sms-language" className="font-medium">
                Language
              </Label>
              <Input
                id="sms-language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                minLength={2}
                maxLength={2}
                placeholder="en"
                className="mt-2"
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="sms-created-at" className="font-medium">
                Created date
              </Label>
              <Input
                id="sms-created-at"
                type="datetime-local"
                value={createdAt}
                onChange={(event) => setCreatedAt(event.target.value)}
                className="mt-2"
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="sms-sent-at" className="font-medium">
                Sent date
              </Label>
              <Input
                id="sms-sent-at"
                type="datetime-local"
                value={sentAt}
                onChange={(event) => setSentAt(event.target.value)}
                className="mt-2"
                disabled={isPending}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="sms-text" className="font-medium">
                Message
              </Label>
              <Textarea
                id="sms-text"
                value={smsText}
                onChange={(event) => setSmsText(event.target.value)}
                maxLength={3000}
                className="mt-2"
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="sms-template" className="font-medium">
                Template
              </Label>
              <Input
                id="sms-template"
                value={template}
                onChange={(event) => setTemplate(event.target.value)}
                maxLength={100}
                placeholder="Optional"
                className="mt-2"
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="sms-retry-counter" className="font-medium">
                Retry count
              </Label>
              <Input
                id="sms-retry-counter"
                type="number"
                min="0"
                step="1"
                value={retryCounter}
                onChange={(event) => setRetryCounter(event.target.value)}
                placeholder="Optional"
                className="mt-2"
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="sms-result-code" className="font-medium">
                Result code
              </Label>
              <Input
                id="sms-result-code"
                value={sentResultCode}
                onChange={(event) => setSentResultCode(event.target.value)}
                maxLength={50}
                placeholder="Optional"
                className="mt-2"
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="sms-result-text" className="font-medium">
                Result text
              </Label>
              <Input
                id="sms-result-text"
                value={sentResultText}
                onChange={(event) => setSentResultText(event.target.value)}
                maxLength={150}
                placeholder="Optional"
                className="mt-2"
                disabled={isPending}
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
              Add SMS
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
