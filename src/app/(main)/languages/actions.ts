"use server";

import { revalidatePath } from "next/cache";

import { createLanguage, LanguagesApiError } from "./api";
import type { LanguageCreate, LanguageRead } from "./types";

export type LanguageActionResult =
  | { ok: true; language: LanguageRead }
  | { ok: false; error: string };

function getActionError(error: unknown): string {
  if (error instanceof LanguagesApiError || error instanceof Error)
    return error.message;
  return "The language request failed.";
}

export async function createLanguageAction(
  input: LanguageCreate,
): Promise<LanguageActionResult> {
  try {
    const language = await createLanguage(input);
    revalidatePath("/languages");
    return { ok: true, language };
  } catch (error) {
    return { ok: false, error: getActionError(error) };
  }
}
