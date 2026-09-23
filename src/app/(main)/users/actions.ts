"use server"

import { revalidatePath } from "next/cache"
import { createUser, deleteUser, updateUser, UsersApiError } from "./api"
import type { UserCreate, UserRead, UserUpdate } from "./types"

export type UserActionResult = { ok: true; user?: UserRead } | { ok: false; error: string }

function getActionError(error: unknown): string {
  if (error instanceof UsersApiError || error instanceof Error) return error.message
  return "The user request failed."
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
