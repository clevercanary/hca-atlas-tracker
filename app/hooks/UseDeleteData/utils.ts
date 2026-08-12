import { getErrorMessage } from "@/app/common/utils";

/**
 * Extracts a human-readable message from an error response, parsing the body
 * and delegating to the shared `getErrorMessage` (see `FormResponseErrors`
 * for the supported body shapes). Always resolves to a non-empty string,
 * falling back to the response status.
 * @param response - Error response.
 * @returns promise (error message).
 */
export async function getResponseErrorMessage(
  response: Response,
): Promise<string> {
  const body: unknown = await response.json().catch(() => undefined);
  return getErrorMessage(body, response.status);
}
