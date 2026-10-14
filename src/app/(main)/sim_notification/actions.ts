"use server";

import { revalidatePath } from "next/cache";
import {
  deleteSimNotification,
  fetchSimNotification,
  SimNotificationsApiError,
} from "./api";
import type { SimNotificationRead } from "./types";

export type SimNotificationActionResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; error: string; status?: number };

function getActionError(error: unknown): { error: string; status?: number } {
  if (error instanceof SimNotificationsApiError) {
    return { error: error.message, status: error.status };
  }
  if (error instanceof Error) return { error: error.message };
  return { error: "The SIM notification request failed." };
}

export async function getSimNotificationAction(
  notificationId: number,
): Promise<SimNotificationActionResult<SimNotificationRead>> {
  try {
    const notification = await fetchSimNotification(notificationId);
    return { ok: true, value: notification };
  } catch (error) {
    return { ok: false, ...getActionError(error) };
  }
}

export async function deleteSimNotificationAction(
  notificationId: number,
): Promise<SimNotificationActionResult> {
  try {
    await deleteSimNotification(notificationId);
    revalidatePath("/sim_notification");
    return { ok: true, value: undefined };
  } catch (error) {
    return { ok: false, ...getActionError(error) };
  }
}
