import { DEFAULT_HEADERS } from "./constants";

/**
 * Returns HTTP headers with authorization token.
 * @param accessToken - Access token.
 * @returns HTTP headers.
 */
export function getHeaders(accessToken?: string): HeadersInit {
  if (!accessToken) return DEFAULT_HEADERS;
  return { ...DEFAULT_HEADERS, authorization: `Bearer ${accessToken}` };
}
