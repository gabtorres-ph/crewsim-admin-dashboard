"use server";

import { revalidatePath } from "next/cache";

import { createCurrency, CurrenciesApiError } from "./api";
import type { CurrencyCreate, CurrencyRead } from "./types";

export type CurrencyActionResult =
  | { ok: true; currency: CurrencyRead }
  | { ok: false; error: string };

function getActionError(error: unknown): string {
  if (error instanceof CurrenciesApiError || error instanceof Error) {
    return error.message;
  }
  return "The currency request failed.";
}

export async function createCurrencyAction(
  input: CurrencyCreate,
): Promise<CurrencyActionResult> {
  try {
    const currency = await createCurrency(input);
    revalidatePath("/currencies");
    return { ok: true, currency };
  } catch (error) {
    return { ok: false, error: getActionError(error) };
  }
}
