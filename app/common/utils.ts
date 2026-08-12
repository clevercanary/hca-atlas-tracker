import { type APIValue } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type RouteValue } from "@/app/routes/entities";
import { DEFAULT_HEADERS } from "./constants";
import { FETCH_STATUS, METHOD, type PathParameter } from "./entities";

/**
 * Returns fetch request options.
 * @param method - Method.
 * @param defaultHeaders - Default headers.
 * @returns fetch request options.
 */
export function getFetchOptions(
  method: METHOD,
  defaultHeaders: HeadersInit = method === METHOD.DELETE ? {} : DEFAULT_HEADERS,
): RequestInit {
  return {
    headers: defaultHeaders,
    method,
  };
}

/**
 * Fetch request.
 * @param requestURL - Request URL.
 * @param requestMethod - Request method.
 * @param payload - Payload.
 * @param additionalFetchOptions - Additional options to pass to `fetch`.
 * @returns promise (response).
 */
export async function fetchResource<P>(
  requestURL: string,
  requestMethod: METHOD,
  payload?: P,
  additionalFetchOptions?: RequestInit,
): Promise<Response> {
  return await fetch(requestURL, {
    ...getFetchOptions(requestMethod, payload ? DEFAULT_HEADERS : undefined),
    body: payload ? JSON.stringify(payload) : undefined,
    ...additionalFetchOptions,
  });
}

/**
 * Extracts a human-readable message from a parsed API error body. The body is
 * a `FormResponseErrors`: either a non-empty `{ message }` or field-keyed
 * `{ errors: { [field]: string[] } }` (the latter for field-level/validation
 * errors). Falls back to the status code when the body has neither shape (or
 * failed to parse).
 * @param body - Parsed error response body (or null/undefined if parsing failed).
 * @param status - Response status code.
 * @returns error message.
 */
export function getErrorMessage(body: unknown, status: number): string {
  const fallbackMessage = `Received ${status} response`;
  if (!body || typeof body !== "object") return fallbackMessage;
  if ("message" in body && typeof body.message === "string" && body.message) {
    return body.message;
  }
  if ("errors" in body && body.errors && typeof body.errors === "object") {
    const messages = Object.values(body.errors)
      .flat()
      .filter((message): message is string => typeof message === "string");
    if (messages.length) return messages.join("; ");
  }
  return fallbackMessage;
}

/**
 * Returns true if the fetch status is "Created".
 * @param status - Status.
 * @returns true if the fetch status is "Created".
 */
export function isFetchStatusCreated(status: number): boolean {
  return status === FETCH_STATUS.CREATED;
}

/**
 * Returns true if the fetch status is "Ok".
 * @param status - Status.
 * @returns true if the fetch status is "Ok".
 */
export function isFetchStatusOk(status: number): boolean {
  return status === FETCH_STATUS.OK || status === FETCH_STATUS.NOT_MODIFIED;
}

/**
 * Replaces API URL path parameters e.g. [atlasId] with the given corresponding ID.
 * @param apiURL - Request URL.
 * @param pathParameter - API path parameter.
 * @returns request URL.
 */
export function getRequestURL(
  apiURL: APIValue,
  pathParameter: PathParameter = {},
): string {
  return replacePathParameters(apiURL, pathParameter);
}

/**
 * Replaces Route URL path parameters e.g. [atlasId] with the given corresponding ID.
 * @param route - Route.
 * @param pathParameter - Route path parameter.
 * @returns route URL.
 */
export function getRouteURL(
  route: RouteValue,
  pathParameter: PathParameter = {},
): string {
  return replacePathParameters(route, pathParameter);
}

/**
 * Replaces path parameters in the given API or URL string with the corresponding ID.
 * @param str - API or URL string, with parameters.
 * @param pathParameter - Path parameter.
 * @returns string with path parameters replaced.
 */
function replacePathParameters(
  str: string,
  pathParameter: PathParameter,
): string {
  const result = Object.entries(pathParameter).reduce(
    (acc, [parameter, parameterId]) => {
      const regex = new RegExp(`\\[${parameter}]`, "g");
      return acc.replace(regex, parameterId);
    },
    str,
  );
  if (/\[\w+]/.test(result)) {
    throw new Error(`URL still contains path parameters: ${result}`);
  }
  return result;
}
