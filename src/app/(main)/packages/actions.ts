"use server";

import { revalidatePath } from "next/cache";

import { createPackage, PackagesApiError } from "./api";
import type { PackageCreate, PackageRead } from "./types";

export type PackageActionResult =
  | { ok: true; package: PackageRead }
  | { ok: false; error: string };

function getActionError(error: unknown): string {
  if (error instanceof PackagesApiError || error instanceof Error)
    return error.message;
  return "The package request failed.";
}

export async function createPackageAction(
  input: PackageCreate,
): Promise<PackageActionResult> {
  try {
    const packageItem = await createPackage(input);
    revalidatePath("/packages");
    return { ok: true, package: packageItem };
  } catch (error) {
    return { ok: false, error: getActionError(error) };
  }
}
