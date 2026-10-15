"use server"

import { revalidatePath } from "next/cache"

import {
  AccountsApiError,
  deleteAccount,
  refreshAccounts,
  updateAccount,
} from "./api"
import type {
  AccountRead,
  AccountRefreshResult,
  AccountUpdate,
} from "./types"

export type AccountActionResult =
  | { ok: true; account?: AccountRead }
  | { ok: false; error: string }

function getActionError(error: unknown): string {
  if (error instanceof AccountsApiError) return error.message
  if (error instanceof Error) return error.message
  return "The account request failed."
}

export type AccountRefreshActionResult =
  | { ok: true; summary: AccountRefreshResult }
  | { ok: false; error: string }

export async function refreshAccountsAction(): Promise<AccountRefreshActionResult> {
  try {
    const summary = await refreshAccounts()
    revalidatePath("/accounts")
    return { ok: true, summary }
  } catch (error) {
    return { ok: false, error: getActionError(error) }
  }
}

export async function updateAccountAction(
  accountId: number,
  input: AccountUpdate,
): Promise<AccountActionResult> {
  try {
    const account = await updateAccount(accountId, input)
    revalidatePath("/accounts")
    return { ok: true, account }
  } catch (error) {
    return { ok: false, error: getActionError(error) }
  }
}

export async function deleteAccountAction(
  accountId: number,
): Promise<AccountActionResult> {
  try {
    await deleteAccount(accountId)
    revalidatePath("/accounts")
    return { ok: true }
  } catch (error) {
    return { ok: false, error: getActionError(error) }
  }
}
