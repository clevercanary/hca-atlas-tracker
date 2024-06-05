import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
import { ROUTE } from "../routes/constants";
import { RouteValue } from "../routes/entities";
import { DEFAULT_HEADERS } from "./constants";
import { FETCH_STATUS, METHOD } from "./entities";

/**
 * Returns fetch request options.
 * @param method - Method.
 * @param accessToken - Access token.
 * @returns fetch request options.
 */
export function getFetchOptions(
  method: METHOD,
  accessToken: string | undefined
): RequestInit {
  return {
    headers: getHeaders(method, accessToken),
    method,
  };
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
 * Returns HTTP headers with authorization token.
 * @param method - Method.
 * @param accessToken - Access token.
 * @param defaultHeaders - Default headers.
 * @returns HTTP headers.
 */
export function getHeaders(
  method: METHOD,
  accessToken?: string,
  defaultHeaders = method === METHOD.DELETE ? {} : DEFAULT_HEADERS
): HeadersInit {
  if (!accessToken) return defaultHeaders;
  return { ...defaultHeaders, ...getHeaderAuthorization(accessToken) };
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
 * Returns true if the fetch status is "No Content".
 * @param status - Status.
 * @returns true if the fetch status is "No Content".
 */
export function isFetchStatusNoContent(status: number): boolean {
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
 * Replaces [atlasId] in the API URL with the given atlas ID and optionally replaces [sdId] with the given source study ID.
 * @param apiURL - Request URL.
 * @param atlasId - Atlas ID.
 * @param sourceStudyId - Source study ID.
 * @returns request URL with Atlas ID.
 */
export function getRequestURL(
  apiURL: API,
  atlasId: string,
  sourceStudyId?: string
): string {
  if (/\[sdId]/.test(apiURL) && sourceStudyId) {
    return apiURL
      .replace(/\[atlasId]/, atlasId)
      .replace(/\[sdId]/, sourceStudyId);
  }
  return apiURL.replace(/\[atlasId]/, atlasId);
}

/**
 * Replaces [atlasId] in route with the given atlas ID and optionally replaces [sdId] with the given source study ID.
 * @param route - Route.
 * @param atlasId - Atlas ID.
 * @param sdId - Source study ID.
 * @returns route with atlas ID.
 */
export function getRouteURL(
  route: RouteValue,
  atlasId: string,
  sdId?: string
): string {
  if (/\[sdId]/.test(route)) {
    if (sdId) {
      return (route as string)
        .replace(/\[atlasId]/, atlasId)
        .replace(/\[sdId]/, sdId);
    }
  } else {
    return (route as string).replace(/\[atlasId]/, atlasId);
  }
  return ROUTE.ATLASES;
}
