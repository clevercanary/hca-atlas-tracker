import { type METHOD } from "@/app/common/entities";
import { fetchResource, isFetchStatusOk } from "@/app/common/utils";
import {
  type QueryFunction,
  type QueryFunctionContext,
  type QueryKey,
} from "@tanstack/react-query";

/**
 * Extracts a human-readable message from a parsed API error body. The body is
 * a `FormResponseErrors`: either `{ message }` or `{ errors: { field:
 * [messages] } }` (the latter for field-level/validation errors). Falls back to
 * the status code when the body has neither shape (or failed to parse).
 * @param body - Parsed error response body (or null if parsing failed).
 * @param status - Response status code.
 * @returns Error message.
 */
function getErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === "object") {
    if ("message" in body && typeof body.message === "string")
      return body.message;
    if ("errors" in body && body.errors && typeof body.errors === "object") {
      const messages = Object.values(body.errors).flat();
      if (messages.length) return messages.join("; ");
    }
  }
  return `Received ${status} response`;
}

/**
 * Builds a generic React Query fetch function: requests the given URL with the
 * given method and resolves to the parsed JSON response, or throws the API
 * error message on a non-OK status. Reused by resource-specific `useQuery`
 * hooks so each only supplies its URL, method and response type.
 * @param requestUrl - Request URL.
 * @param method - HTTP method.
 * @returns Query function resolving to the response data.
 */
export function queryFn<T, K extends QueryKey = QueryKey>(
  requestUrl: string,
  method: METHOD,
): QueryFunction<T, K> {
  return async ({ signal }: QueryFunctionContext<K>) => {
    const response = await fetchResource(requestUrl, method, undefined, {
      signal,
    });
    if (isFetchStatusOk(response.status)) return response.json();
    const body = await response.json().catch(() => null);
    throw new Error(getErrorMessage(body, response.status));
  };
}
