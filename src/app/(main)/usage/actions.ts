"use server";

import { revalidatePath } from "next/cache";

import { createUsage, deleteUsage, updateUsage, UsageApiError } from "./api";
import type { UsageCreate, UsageRead, UsageUpdate } from "./types";

export type UsageActionResult =
  | { ok: true; usage?: UsageRead }
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

export async function updateUsageAction(
  usageId: number,
  input: UsageUpdate,
): Promise<UsageActionResult> {
  try {
    const usage = await updateUsage(usageId, input);
    revalidatePath("/usage");
    return { ok: true, usage };
  } catch (error) {
    return { ok: false, error: getActionError(error) };
  }
}

export async function deleteUsageAction(
  usageId: number,
): Promise<UsageActionResult> {
  try {
    await deleteUsage(usageId);
    revalidatePath("/usage");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionError(error) };
  }
}
