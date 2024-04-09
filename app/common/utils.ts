import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
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
    headers: getHeaders(accessToken),
    method,
  };
}

/**
 * Returns HTTP authorization header.
 * @param accessToken - Access token.
 * @returns HTTP authorization header.
 */
export function getHeaderAuthorization(
  accessToken?: string
): HeadersInit | undefined {
  if (!accessToken) return;
  return { authorization: `Bearer ${accessToken}` };
}

/**
 * Returns HTTP headers with authorization token.
 * @param accessToken - Access token.
 * @returns HTTP headers.
 */
export function getHeaders(accessToken?: string): HeadersInit {
  if (!accessToken) return DEFAULT_HEADERS;
  return { ...DEFAULT_HEADERS, ...getHeaderAuthorization(accessToken) };
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
 * Replaces [atlasId] in the API URL with the given atlas ID.
 * @param apiURL - Request URL.
 * @param atlasId - Atlas ID.
 * @returns request URL with Atlas ID.
 */
export function getRequestURL(apiURL: API, atlasId: string): string {
  return apiURL.replace(/\[atlasId]/, atlasId);
}

/**
 * Replaces [atlasId] in route with the given atlas ID.
 * @param route - Route.
 * @param atlasId - Atlas ID.
 * @returns route with atlas ID.
 */
export function getRouteURL(route: RouteValue, atlasId: string): string {
  return (route as string).replace(/\[atlasId]/, atlasId);
}
