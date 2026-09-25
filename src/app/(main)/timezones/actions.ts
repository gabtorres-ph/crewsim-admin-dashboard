"use server";

import { revalidatePath } from "next/cache";

import { createTimezone, TimezonesApiError } from "./api";
import type { TimezoneCreate, TimezoneRead } from "./types";

export type TimezoneActionResult =
  | { ok: true; timezone: TimezoneRead }
  | { ok: false; error: string };

function getActionError(error: unknown): string {
  if (error instanceof TimezonesApiError || error instanceof Error) {
    return error.message;
  }
  return "The timezone request failed.";
}

export async function createTimezoneAction(
  input: TimezoneCreate,
): Promise<TimezoneActionResult> {
  try {
    const timezone = await createTimezone(input);
    revalidatePath("/timezones");
    return { ok: true, timezone };
  } catch (error) {
    return { ok: false, error: getActionError(error) };
  }
}
