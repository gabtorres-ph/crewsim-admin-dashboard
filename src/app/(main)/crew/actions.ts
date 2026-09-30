"use server";

import { revalidatePath } from "next/cache";

import { createCrew, CrewApiError, deleteCrew, updateCrew } from "./api";
import type { CrewCreate, CrewRead, CrewUpdate } from "./types";

export type CrewActionResult =
  | { ok: true; crew: CrewRead }
  | { ok: false; error: string };

export type CrewDeleteActionResult = { ok: true } | { ok: false; error: string };

const MAX_BULK_DELETE = 100;

function getActionError(error: unknown): string {
  if (error instanceof CrewApiError || error instanceof Error)
    return error.message;
  return "The crew request failed.";
}

export async function createCrewAction(
  input: CrewCreate,
): Promise<CrewActionResult> {
  try {
    const crew = await createCrew(input);
    revalidatePath("/crew");
    return { ok: true, crew };
  } catch (error) {
    return { ok: false, error: getActionError(error) };
  }
}

export async function updateCrewAction(
  crewId: number,
  input: CrewUpdate,
): Promise<CrewActionResult> {
  try {
    const crew = await updateCrew(crewId, input);
    revalidatePath("/crew");
    return { ok: true, crew };
  } catch (error) {
    return { ok: false, error: getActionError(error) };
  }
}

export async function deleteCrewAction(
  crewId: number,
): Promise<CrewDeleteActionResult> {
  try {
    await deleteCrew(crewId);
    revalidatePath("/crew");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: getActionError(error) };
  }
}

export async function deleteCrewMembersAction(
  crewIds: number[],
): Promise<CrewDeleteActionResult> {
  if (!Array.isArray(crewIds) || crewIds.length === 0) {
    return { ok: false, error: "Select at least one crew member to delete." };
  }
  const uniqueIds = Array.from(new Set(crewIds));
  if (uniqueIds.length > MAX_BULK_DELETE) {
    return {
      ok: false,
      error: `You can delete at most ${MAX_BULK_DELETE} crew members at once.`,
    };
  }

  const results = await Promise.allSettled(uniqueIds.map(deleteCrew));
  const failures = results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  if (failures.length < uniqueIds.length) revalidatePath("/crew");
  if (failures.length === 0) return { ok: true };

  const deletedCount = uniqueIds.length - failures.length;
  return {
    ok: false,
    error: `Deleted ${deletedCount} of ${uniqueIds.length} crew members. ${getActionError(failures[0].reason)}`,
  };
}
