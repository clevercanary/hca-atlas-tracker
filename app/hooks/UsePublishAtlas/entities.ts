import { type HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type RequestOptions } from "@/app/common/entities";
import { type QueryKey as AtlasQueryKey } from "@/app/hooks/UseFetchAtlas/query/types";

export interface OnSubmitOptions extends Pick<
  RequestOptions,
  "invalidateQueryKeys"
> {
  /**
   * The atlas query the published atlas from the response is merged into on
   * success. Supplied by the caller rather than built from the response's `id`:
   * the view may have loaded the atlas by another identifier, and its query is
   * keyed on that.
   */
  atlasQueryKey?: AtlasQueryKey;
  onSuccess?: () => void;
}

export type OnSubmitFn = (
  requestURL: string,
  options?: OnSubmitOptions,
) => Promise<boolean>;

/**
 * The published atlas, as far as the 200 body is checked: its `publishedAt`,
 * which is what the view's Publish action is computed from.
 */
export type PublishedAtlas = Pick<HCAAtlasTrackerAtlas, "publishedAt">;

export interface PublishAtlasActions {
  onDismissError: () => void;
  onSubmit: OnSubmitFn;
}

export interface PublishAtlasStatus {
  error: string | undefined;
  isRequesting: boolean;
  succeeded: boolean;
}

export interface UsePublishAtlas {
  actions: PublishAtlasActions;
  status: PublishAtlasStatus;
}
