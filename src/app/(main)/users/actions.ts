"use server"

import { revalidatePath } from "next/cache"
import { fetchAllOffsetPages } from "@/lib/fetchAllPages"
import { fetchCurrencies } from "../currencies/api"
import { fetchLanguages } from "../languages/api"
import { fetchTimezones } from "../timezones/api"
import { createUser, deleteUser, updateUser, UsersApiError } from "./api"
import type { UserCreate, UserRead, UserUpdate } from "./types"

export type UserActionResult = { ok: true; user?: UserRead } | { ok: false; error: string }
export type UserFormOptionsResult =
  | {
      ok: true
      languages: { id: number; name: string; iso1: string | null }[]
      currencies: { id: number; name: string; code: string }[]
      timezones: { name: string }[]
    }
  | { ok: false; error: string }

function getActionError(error: unknown): string {
  if (error instanceof UsersApiError || error instanceof Error) return error.message
  return "The user request failed."
}

export async function fetchUserFormOptionsAction(): Promise<UserFormOptionsResult> {
  try {
    const [languages, currencies, timezones] = await Promise.all([
      fetchAllOffsetPages(fetchLanguages),
      fetchAllOffsetPages(fetchCurrencies),
      fetchAllOffsetPages(fetchTimezones),
    ])
    return {
      ok: true,
      languages: languages.map(({ id, name, iso1 }) => ({ id, name, iso1 })),
      currencies: currencies.map(({ id, name, code }) => ({ id, name, code })),
      timezones: timezones.map(({ name }) => ({ name })),
    }
  } catch (error) {
    return { ok: false, error: getActionError(error) }
  }
}

export async function createUserAction(input: UserCreate): Promise<UserActionResult> {
  try {
    const user = await createUser(input)
    revalidatePath("/users")
    return { ok: true, user }
  } catch (error) {
    return { ok: false, error: getActionError(error) }
  }
}

export async function updateUserAction(userId: number, input: UserUpdate): Promise<UserActionResult> {
  try {
    const user = await updateUser(userId, input)
    revalidatePath("/users")
    return { ok: true, user }
  } catch (error) {
    return { ok: false, error: getActionError(error) }
  }
}

export async function deleteUserAction(userId: number): Promise<UserActionResult> {
  try {
    await deleteUser(userId)
    revalidatePath("/users")
    return { ok: true }
  } catch (error) {
    return { ok: false, error: getActionError(error) }
  }
}
