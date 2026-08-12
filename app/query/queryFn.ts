import { type METHOD } from "@/app/common/entities";
import {
  fetchResource,
  getErrorMessage,
  isFetchStatusOk,
} from "@/app/common/utils";
import {
  type QueryFunction,
  type QueryFunctionContext,
  type QueryKey,
} from "@tanstack/react-query";

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
