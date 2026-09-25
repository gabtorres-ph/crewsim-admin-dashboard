"use server";

import { revalidatePath } from "next/cache";

import { createStripeNotification, StripeNotificationsApiError } from "./api";
import type { StripeNotificationCreate, StripeNotificationRead } from "./types";

export type StripeNotificationActionResult =
  | { ok: true; notification: StripeNotificationRead }
  | { ok: false; error: string };

function getActionError(error: unknown): string {
  if (error instanceof StripeNotificationsApiError || error instanceof Error)
    return error.message;
  return "The Stripe notification request failed.";
}

export async function createStripeNotificationAction(
  input: StripeNotificationCreate,
): Promise<StripeNotificationActionResult> {
  try {
    const notification = await createStripeNotification(input);
    revalidatePath("/stripe_notification");
    return { ok: true, notification };
  } catch (error) {
    return { ok: false, error: getActionError(error) };
  }
}
