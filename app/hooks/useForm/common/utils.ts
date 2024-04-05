import { FieldValues } from "react-hook-form";
import { METHOD } from "../../../common/entities";
import { getFetchOptions, getHeaderAuthorization } from "../../../common/utils";
import { YupValidatedFormValues } from "./entities";

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
export async function fetchSubmit<T extends FieldValues>(
  requestURL: string,
  requestMethod: METHOD,
  accessToken: string | undefined,
  payload: YupValidatedFormValues<T>
): Promise<Response> {
  return await fetch(requestURL, {
    ...getFetchOptions(requestMethod, accessToken),
    body: JSON.stringify(payload),
  });
}

/**
 * Throws an error with the message from the response.
 * @param response - Response.
 * @returns promise (void).
 */
export async function throwError(response: Response): Promise<void> {
  throw new Error(
    await response
      .json()
      .then(({ message }) => message)
      .catch(() => `Received ${response.status} response`)
  );
}
