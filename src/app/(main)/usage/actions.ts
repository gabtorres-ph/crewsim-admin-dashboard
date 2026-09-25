"use server";

import { revalidatePath } from "next/cache";

import { createUsage, UsageApiError } from "./api";
import type { UsageCreate, UsageRead } from "./types";

export type UsageActionResult =
  | { ok: true; usage: UsageRead }
  | { ok: false; error: string };

function getActionError(error: unknown): string {
  if (error instanceof UsageApiError || error instanceof Error)
    return error.message;
  return "The usage request failed.";
}

export async function createUsageAction(
  input: UsageCreate,
): Promise<UsageActionResult> {
  try {
    const usage = await createUsage(input);
    revalidatePath("/usage");
    return { ok: true, usage };
  } catch (error) {
    return { ok: false, error: getActionError(error) };
  }
}
