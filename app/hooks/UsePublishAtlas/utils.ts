import { type HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { readJsonBody } from "@/app/common/utils";
import { type QueryClient } from "@tanstack/react-query";
import { type OnSubmitOptions, type PublishedAtlas } from "./entities";

/**
 * Returns the publish request's `onSuccess`. It merges the published atlas's
 * `publishedAt` into `options.atlasQueryKey`'s cached atlas, then calls
 * `options.onSuccess`.
 *
 * The cached atlas is what the publish controls are disabled from — the view's
 * Publish action and the dialog's Publish button alike — and, unlike component
 * state, it survives a remount: if the awaited atlas refetch fails, the atlas
 * query throws to the app error boundary, and returning to the atlas mounts a
 * fresh view while the query refetches. With `publishedAt` in the cache, the
 * view renders the atlas as published throughout, so Publish is never offered
 * again.
 *
 * Only `publishedAt` is merged — the one field the body is checked for — so a
 * body missing or mistyping others can't put them in the cache, and the
 * order of this write and the refetch doesn't matter: both carry the same
 * `publishedAt`, and the refetch brings everything else. With nothing cached
 * there is nothing to guard, and nothing is written.
 * @param queryClient - Query client.
 * @param options - Submit options.
 * @returns success callback for the request.
 */
export function getOnPublishSuccess(
  queryClient: QueryClient,
  options: OnSubmitOptions | undefined,
): (atlas: PublishedAtlas | undefined) => void {
  return (atlas): void => {
    if (atlas && options?.atlasQueryKey) {
      queryClient.setQueryData<HCAAtlasTrackerAtlas>(
        options.atlasQueryKey,
        (cached) => cached && { ...cached, publishedAt: atlas.publishedAt },
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
