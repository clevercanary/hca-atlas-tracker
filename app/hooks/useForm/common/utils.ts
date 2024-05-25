import { METHOD } from "../../../common/entities";
import { getFetchOptions, getHeaderAuthorization } from "../../../common/utils";
import { FormResponseErrors } from "./entities";

/**
 * Delete request.
 * @param requestURL - Request URL.
 * @param requestMethod - Request method.
 * @param accessToken - Access token.
 * @returns promise (response).
 */
export async function fetchDelete(
  requestURL: string,
  requestMethod: METHOD,
  accessToken?: string
): Promise<Response> {
  return await fetch(requestURL, {
    ...getHeaderAuthorization(accessToken),
    method: requestMethod,
  });
}

/**
 * Submit request.
 * @param requestURL - Request URL.
 * @param requestMethod - Request method.
 * @param accessToken - Access token.
 * @param payload - Payload.
 * @returns promise (response).
 */
export async function fetchSubmit<P>(
  requestURL: string,
  requestMethod: METHOD,
  accessToken: string | undefined,
  payload: P
): Promise<Response> {
  return await fetch(requestURL, {
    ...getFetchOptions(requestMethod, accessToken),
    body: JSON.stringify(payload),
  });
}

/**
 * Get error information from the response.
 * @param response - Response.
 * @returns promise (response errors).
 */
export async function getFormResponseErrors(
  response: Response
): Promise<FormResponseErrors> {
  return await response
    .json()
    .catch(() => ({ message: `Received ${response.status} response` }));
}
