"use server";

import { revalidatePath } from "next/cache";

import { createCrew, CrewApiError } from "./api";
import type { CrewCreate, CrewRead } from "./types";

export type CrewActionResult =
  | { ok: true; crew: CrewRead }
  | { ok: false; error: string };

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
