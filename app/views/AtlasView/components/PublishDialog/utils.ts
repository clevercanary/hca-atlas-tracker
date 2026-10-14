import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { type QueryKey as AtlasQueryKey } from "@/app/hooks/UseFetchAtlas/query/types";
import {
  type OnSubmitFn,
  type OnSubmitOptions,
} from "@/app/hooks/UsePublishAtlas/entities";
import { SOURCE_DATASETS } from "@/app/views/AtlasSourceDatasetsView/hooks/UseFetchAtlasSourceDatasets/query/constants";
import { INTEGRATED_OBJECTS } from "@/app/views/ComponentAtlasesView/hooks/UseFetchComponentAtlases/query/constants";

/**
 * Returns the publish request options. The atlas is awaited, so the request
 * stays pending — and the dialog open, with every exit and both actions
 * disabled — until the refetched atlas lands. The view's Publish action is
 * computed from that atlas, so the dialog can't close onto a Publish action
 * still offered by the stale cache (#1551).
 *
 * The same key is where the published atlas from the response is merged, which
 * keeps the view showing it as published even if that refetch fails (see
 * `usePublishAtlas`).
 *
 * Publishing also stamps the atlas's unpublished source datasets and integrated
 * objects with the release date, so their lists are refreshed too — dispatched,
 * not awaited, as no control here depends on them.
 * @param pathParameter - Path parameter.
 * @returns publish request options.
 */
export function getPublishOptions(
  pathParameter: PathParameter,
): OnSubmitOptions {
  // Typed as the fetch hook's own key tuple: a segment added to the key is then
  // a compile error here, rather than an invalidation matching nothing — which
  // resolves immediately and silently reopens the window.
  const atlasQueryKey: AtlasQueryKey = [ATLAS, pathParameter.atlasId];
  return {
    atlasQueryKey,
    invalidateQueryKeys: {
      awaited: [atlasQueryKey],
      dispatched: [
        [INTEGRATED_OBJECTS, pathParameter.atlasId],
        [SOURCE_DATASETS, pathParameter.atlasId],
      ],
    },
  };
}

/**
 * Publishes the atlas, then calls `onPublished` once the request has resolved
 * — after the refetched atlas has landed — rather than from `onSuccess`, which
 * runs alongside that refetch: closing there would leave the view's Publish
 * action enabled against the stale atlas until the refetch lands (#1551).
 * `onPublished` is guarded, as `onSuccess` would have been, so a throwing
 * handler is logged rather than left as an unhandled rejection.
 * @param onSubmit - Publish request function.
 * @param pathParameter - Path parameter.
 * @param onPublished - Called once the publish has succeeded and the atlas has
 * refetched.
 * @returns promise resolving once the attempt has completed.
 */
export async function submitPublish(
  onSubmit: OnSubmitFn,
  pathParameter: PathParameter,
  onPublished: () => void,
): Promise<void> {
  const published = await onSubmit(
    getRequestURL(API.ATLAS_PUBLISH, pathParameter),
    getPublishOptions(pathParameter),
  );
  if (!published) return;
  try {
    onPublished();
  } catch (e) {
    console.error(e);
  }
}
