"use server"

import { revalidatePath } from "next/cache"
import { createFavorite, deleteFavorite, FavoritesApiError } from "./api"
import type { FavoriteCreate, FavoriteRead } from "./types"

export type FavoriteActionResult =
  | { ok: true; favorite?: FavoriteRead }
  | { ok: false; error: string }

function getActionError(error: unknown): string {
  if (error instanceof FavoritesApiError || error instanceof Error) return error.message
  return "The favorite request failed."
}

export async function createFavoriteAction(
  input: FavoriteCreate,
): Promise<FavoriteActionResult> {
  try {
    const favorite = await createFavorite(input)
    revalidatePath("/favorites")
    return { ok: true, favorite }
  } catch (error) {
    return { ok: false, error: getActionError(error) }
  }
}

export async function deleteFavoriteAction(
  favoriteId: number,
): Promise<FavoriteActionResult> {
  try {
    await deleteFavorite(favoriteId)
    revalidatePath("/favorites")
    return { ok: true }
  } catch (error) {
    return { ok: false, error: getActionError(error) }
  }
}
