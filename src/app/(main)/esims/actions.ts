"use server"

import { revalidatePath } from "next/cache"
import { createEsim, deleteEsim, EsimsApiError, updateEsim } from "./api"
import type { EsimCreate, EsimRead, EsimUpdate } from "./types"

export type EsimActionResult = { ok: true; esim?: EsimRead } | { ok: false; error: string }

function getActionError(error: unknown): string {
  if (error instanceof EsimsApiError || error instanceof Error) return error.message
  return "The eSIM request failed."
}

export async function createEsimAction(input: EsimCreate): Promise<EsimActionResult> {
  try { const esim = await createEsim(input); revalidatePath("/esims"); return { ok: true, esim } } catch (error) { return { ok: false, error: getActionError(error) } }
}

export async function updateEsimAction(id: number, input: EsimUpdate): Promise<EsimActionResult> {
  try { const esim = await updateEsim(id, input); revalidatePath("/esims"); return { ok: true, esim } } catch (error) { return { ok: false, error: getActionError(error) } }
}

export async function deleteEsimAction(id: number): Promise<EsimActionResult> {
  try { await deleteEsim(id); revalidatePath("/esims"); return { ok: true } } catch (error) { return { ok: false, error: getActionError(error) } }
}
