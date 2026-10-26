"use server";

import { revalidatePath } from "next/cache";
import { refreshRoamingPlanDetails } from "./api";

export type RoamingPlanDetailsRefreshActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function refreshRoamingPlanDetailsAction(
  tariffId: number,
): Promise<RoamingPlanDetailsRefreshActionResult> {
  try {
    await refreshRoamingPlanDetails(tariffId);
    revalidatePath("/roaming-plan-details");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "The roaming plan details refresh failed.",
    };
  }
}
