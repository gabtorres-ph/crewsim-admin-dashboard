"use server"

import { revalidatePath } from "next/cache"
import {
  createEsim,
  deleteEsim,
  EsimMoveApiError,
  EsimsApiError,
  fetchNetworkStatusHistory,
  moveEsimsToAccount,
  normalizeEsimUpdate,
  refreshEsimByImsi,
  updateEsim,
} from "./api"
import type {
  EsimCreate,
  EsimMoveFailure,
  EsimMoveResult,
  EsimRead,
  EsimUpdate,
  NetworkStatusRecord,
} from "./types"

export type EsimActionResult = { ok: true; esim?: EsimRead } | { ok: false; error: string }

export type NetworkStatusActionResult =
  | { ok: true; records: NetworkStatusRecord[] }
  | { ok: false; error: string }

type EsimMoveSaveStatus =
  | { status: "not-required" }
  | { status: "completed"; results: EsimMoveResult[] }
  | { status: "failed"; error: string; failure?: EsimMoveFailure }

type EsimUpdateSaveStatus =
  | { status: "not-required" }
  | { status: "completed"; esim: EsimRead }
  | { status: "failed"; error: string }

export type EsimSaveActionResult = {
  ok: boolean
  move: EsimMoveSaveStatus
  update: EsimUpdateSaveStatus
  reconciliationRequired: boolean
}

function getActionError(error: unknown): string {
  if (error instanceof EsimsApiError || error instanceof Error) return error.message
  return "The eSIM request failed."
}

function revalidateMovePaths(): void {
  revalidatePath("/esims")
  revalidatePath("/accounts")
}

function getChangedUpdateFields(esim: EsimRead, input: EsimUpdate): EsimUpdate {
  const changedEntries = Object.entries(input).filter(
    ([field, value]) => field !== "account_id" && value !== esim[field as keyof EsimRead],
  )
  return Object.fromEntries(changedEntries) as EsimUpdate
}

/**
 * Saves ordinary fields with PATCH and moves an eSIM through the provider only
 * when its selected account changes. The caller must reconcile after a failed
 * transfer because provider work may already have completed.
 */
export async function saveEsimAction(
  esim: EsimRead,
  input: EsimUpdate,
): Promise<EsimSaveActionResult> {
  let normalizedInput: EsimUpdate

  try {
    normalizedInput = normalizeEsimUpdate(input)
  } catch (error) {
    return {
      ok: false,
      move: { status: "not-required" },
      update: { status: "failed", error: getActionError(error) },
      reconciliationRequired: false,
    }
  }

  const destinationAccountId = normalizedInput.account_id ?? esim.account_id
  const updateInput = getChangedUpdateFields(esim, normalizedInput)
  const accountChanged = destinationAccountId !== esim.account_id
  let move: EsimMoveSaveStatus = { status: "not-required" }

  if (accountChanged) {
    try {
      const results = await moveEsimsToAccount({
        source_account_id: esim.account_id,
        destination_account_id: destinationAccountId,
        imsis: [esim.imsi],
      })
      move = { status: "completed", results }
      revalidateMovePaths()
    } catch (error) {
      revalidateMovePaths()
      return {
        ok: false,
        move: {
          status: "failed",
          error: getActionError(error),
          ...(error instanceof EsimMoveApiError && error.failure
            ? { failure: error.failure }
            : {}),
        },
        update: { status: "not-required" },
        reconciliationRequired: true,
      }
    }
  }

  if (Object.keys(updateInput).length === 0) {
    return {
      ok: true,
      move,
      update: { status: "not-required" },
      reconciliationRequired: false,
    }
  }

  try {
    const updatedEsim = await updateEsim(esim.id, updateInput)
    revalidatePath("/esims")
    return {
      ok: true,
      move,
      update: { status: "completed", esim: updatedEsim },
      reconciliationRequired: false,
    }
  } catch (error) {
    if (accountChanged) revalidateMovePaths()
    return {
      ok: false,
      move,
      update: { status: "failed", error: getActionError(error) },
      reconciliationRequired: false,
    }
  }
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

export async function refreshEsimAction(imsi: string): Promise<EsimActionResult> {
  try {
    await refreshEsimByImsi(imsi)
    revalidatePath("/esims")
    return { ok: true }
  } catch (error) {
    return { ok: false, error: getActionError(error) }
  }
}

export async function getNetworkStatusHistoryAction(
  imsi: string,
): Promise<NetworkStatusActionResult> {
  try {
    return { ok: true, records: await fetchNetworkStatusHistory(imsi) }
  } catch (error) {
    return { ok: false, error: getActionError(error) }
  }
}
