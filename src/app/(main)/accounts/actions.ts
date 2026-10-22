"use server"

import { revalidatePath } from "next/cache"

import { fetchAllOffsetPages } from "@/lib/fetchAllPages"
import { refreshEsimsForAccount } from "../esims/api"
import {
  AccountsApiError,
  deleteAccount,
  fetchAccounts,
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

function getActionError(error: unknown, fallback = "The account request failed."): string {
  if (error instanceof AccountsApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}

export type AccountRefreshActionResult =
  | { ok: true; summary: AccountRefreshResult }
  | { ok: false; error: string }

export type AccountEsimRefreshActionResult =
  | { ok: true; refreshedCount: number }
  | { ok: false; error: string }

export type AccountOptionsActionResult =
  | { ok: true; accounts: Pick<AccountRead, "id" | "name">[] }
  | { ok: false; error: string }

export async function fetchAccountOptionsAction(): Promise<AccountOptionsActionResult> {
  try {
    const accounts = await fetchAllOffsetPages(fetchAccounts)
    return { ok: true, accounts: accounts.map(({ id, name }) => ({ id, name })) }
  } catch (error) {
    return { ok: false, error: getActionError(error, "Could not load accounts.") }
  }
}

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

export async function refreshAccountEsims(
  accountId: number,
): Promise<AccountEsimRefreshActionResult> {
  try {
    const esims = await refreshEsimsForAccount(accountId)
    revalidatePath("/esims")
    return { ok: true, refreshedCount: esims.length }
  } catch (error) {
    return { ok: false, error: getActionError(error, "The eSIM refresh request failed.") }
  }
}
