import { type RequestOptions } from "@/app/common/entities";

export type OnSubmitFn = (
  requestURL: string,
  payload: Payload,
  options?: OnSubmitOptions,
) => Promise<boolean>;

export interface OnSubmitOptions extends Pick<
  RequestOptions,
  "invalidateQueryKeys"
> {
  /**
   * Side effects other than cache invalidation. The caches a success refreshes
   * — and which of them the pending window waits for — belong in
   * `invalidateQueryKeys`, where the request layer performs them; nothing here
   * has to be `return`ed for that window to hold.
   *
   * The callback is awaited alongside those invalidations, and TypeScript
   * accepts an `async` arrow for a `void` return, so anything slow written
   * here does extend the pending window. Keep it synchronous.
   */
  onSuccess?: () => void;
}

export interface Payload {
  fileIds: string[];
}

export interface UseEditFileArchived {
  isRequesting: boolean;
  onSubmit: OnSubmitFn;
}
