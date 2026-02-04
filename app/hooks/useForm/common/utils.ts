import { FormResponseErrors } from "./entities";

/**
 * Get error information from the response.
 * @param response - Response.
 * @returns promise (response errors).
 */
export async function getFormResponseErrors(
  response: Response,
): Promise<FormResponseErrors> {
  return await response
    .json()
    .catch(() => ({ message: `Received ${response.status} response` }));
}
