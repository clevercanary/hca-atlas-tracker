import { APIValue } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { RouteValue } from "../routes/entities";
import { DEFAULT_HEADERS } from "./constants";
import { FETCH_STATUS, METHOD, PathParameter } from "./entities";

/**
 * Returns fetch request options.
 * @param method - Method.
 * @param defaultHeaders - Default headers.
 * @returns fetch request options.
 */
export function getFetchOptions(
  method: METHOD,
  defaultHeaders: HeadersInit = method === METHOD.DELETE ? {} : DEFAULT_HEADERS
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
 * @param additionalFetchOptions - Additional fetch options.
 * @returns promise (response).
 */
export async function fetchResource<P>(
  requestURL: string,
  requestMethod: METHOD,
  payload?: P,
  additionalFetchOptions?: RequestInit
): Promise<Response> {
  return await fetch(requestURL, {
    ...getFetchOptions(requestMethod, payload ? DEFAULT_HEADERS : undefined),
    body: payload ? JSON.stringify(payload) : undefined,
    ...additionalFetchOptions,
  });
}

/**
 * Returns HTTP authorization header.
 * @param accessToken - Access token.
 * @returns HTTP authorization header.
 */
export function getHeaderAuthorization(accessToken?: string): HeadersInit {
  if (!accessToken) return {};
  return { authorization: `Bearer ${accessToken}` };
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
  pathParameter: PathParameter = {}
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
  pathParameter: PathParameter = {}
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
  pathParameter: PathParameter
): string {
  const result = Object.entries(pathParameter).reduce(
    (acc, [parameter, parameterId]) => {
      const regex = new RegExp(`\\[${parameter}]`, "g");
      return acc.replace(regex, parameterId);
    },
    str
  );
  if (/\[\w+]/.test(result)) {
    throw new Error(`URL still contains path parameters: ${result}`);
  }
  return result;
}
