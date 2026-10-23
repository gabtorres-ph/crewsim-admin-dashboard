"use server";

import { revalidatePath } from "next/cache";
import { refreshRoamingPlans } from "./api";
import type { RoamingPlanRefreshResult } from "./types";

export type RoamingPlanRefreshActionResult =
  | { ok: true; summary: RoamingPlanRefreshResult }
  | { ok: false; error: string };

export async function refreshRoamingPlansAction(): Promise<RoamingPlanRefreshActionResult> {
  try {
    const summary = await refreshRoamingPlans();
    revalidatePath("/roaming-plans");
    return { ok: true, summary };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "The roaming plan refresh failed.",
    };
  }
}
