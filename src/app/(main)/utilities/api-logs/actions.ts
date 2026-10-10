"use server";

import { fetchRequestLog, RequestLogsApiError } from "./api";
import type { RequestLogDetail } from "./types";

export type RequestLogActionResult =
  | { ok: true; log: RequestLogDetail }
  | { ok: false; error: string };

function getActionError(error: unknown): string {
  if (error instanceof RequestLogsApiError || error instanceof Error)
    return error.message;
  return "The request log request failed.";
}

export async function getRequestLogAction(
  requestId: string,
): Promise<RequestLogActionResult> {
  try {
    const log = await fetchRequestLog(requestId);
    return { ok: true, log };
  } catch (error) {
    return { ok: false, error: getActionError(error) };
  }
}
