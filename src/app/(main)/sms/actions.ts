"use server";

import { revalidatePath } from "next/cache";

import { createSms, SmsApiError } from "./api";
import type { SmsCreate, SmsRead } from "./types";

export type SmsActionResult =
  | { ok: true; sms: SmsRead }
  | { ok: false; error: string };

function getActionError(error: unknown): string {
  if (error instanceof SmsApiError || error instanceof Error)
    return error.message;
  return "The SMS request failed.";
}

export async function createSmsAction(
  input: SmsCreate,
): Promise<SmsActionResult> {
  try {
    const sms = await createSms(input);
    revalidatePath("/sms");
    return { ok: true, sms };
  } catch (error) {
    return { ok: false, error: getActionError(error) };
  }
}
