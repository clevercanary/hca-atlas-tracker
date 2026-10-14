import { type HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { readJsonBody } from "@/app/common/utils";
import { type QueryClient } from "@tanstack/react-query";
import { type Dispatch, type SetStateAction } from "react";
import { type OnSubmitOptions, type PublishedAtlas } from "./entities";

/**
 * Returns the publish request's `onSuccess`. It latches `succeeded`, merges the
 * published atlas into `options.atlasQueryKey`'s cached atlas, then calls
 * `options.onSuccess`.
 *
 * Latched here — inside the pending window, while `isRequesting` is still true
 * — rather than once the request resolves, so the publish control's disabled
 * state never depends on how React batches the reset of one flag with the
 * setting of the other.
 *
 * The cache write is what guards a remount. The latch is component state, so
 * it is lost if the awaited atlas refetch fails: the atlas query throws to the
 * app error boundary, and returning to the atlas mounts a fresh dialog while
 * the query refetches. With the publish response in the cache, the view renders
 * the atlas as published throughout, so its Publish action never reappears.
 *
 * Merged into the cached atlas rather than replacing it, so a body missing
 * fields the view reads can't take them out of the cache; with nothing cached
 * there is nothing to guard, and nothing is written. There's no `cancelQueries`
 * first, as there is after an atlas edit: any fetch in flight was started by
 * the invalidation on commit, so it can only bring post-publish data.
 * @param queryClient - Query client.
 * @param setSucceeded - Setter for the `succeeded` latch.
 * @param options - Submit options.
 * @returns success callback for the request.
 */
export function getOnPublishSuccess(
  queryClient: QueryClient,
  setSucceeded: Dispatch<SetStateAction<boolean>>,
  options: OnSubmitOptions | undefined,
): (atlas: PublishedAtlas | undefined) => void {
  return (atlas): void => {
    setSucceeded(true);
    if (atlas && options?.atlasQueryKey) {
      queryClient.setQueryData<HCAAtlasTrackerAtlas>(
        options.atlasQueryKey,
        (cached) => cached && { ...cached, ...atlas },
      );
    }
    options?.onSuccess?.();
  };
}

/**
 * Returns true if the parsed body is a published atlas: an object with a string
 * `publishedAt`.
 * @param body - Parsed response body.
 * @returns true if the body is a published atlas.
 */
function isPublishedAtlas(body: unknown): body is PublishedAtlas {
  return (
    typeof body === "object" &&
    body !== null &&
    "publishedAt" in body &&
    typeof body.publishedAt === "string"
  );
}

/**
 * Parses the published atlas from the publish endpoint's 200 body. Never
 * rejects: by then the atlas is published, so an unreadable body mustn't be
 * reported as a failure (#1550) — it resolves `undefined`, and the atlas cache
 * is left to the awaited refetch.
 * @param res - The 200 response.
 * @returns promise resolving to the published atlas, or undefined if the body
 * doesn't identify one.
 */
export async function parsePublishedAtlas(
  res: Response,
): Promise<PublishedAtlas | undefined> {
  try {
    const body = await readJsonBody(res);
    return isPublishedAtlas(body) ? body : undefined;
  } catch {
    return undefined;
  }
}
