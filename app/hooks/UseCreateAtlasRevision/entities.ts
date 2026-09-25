import { type HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";

export interface CreateAtlasRevisionActions {
  onDismissError: () => void;
  onSubmit: OnSubmitFn;
}

export interface CreateAtlasRevisionStatus {
  error: string | undefined;
  isRequesting: boolean;
  succeeded: boolean;
}

/**
 * The created atlas, as far as the 201 body is checked: its `id`, which is what
 * a caller needs to open it.
 */
export type CreatedAtlas = Pick<HCAAtlasTrackerAtlas, "id">;

export interface OnSubmitOptions {
  onSuccess?: (atlas: CreatedAtlas) => void;
}

export type OnSubmitFn = (
  requestURL: string,
  options?: OnSubmitOptions,
) => Promise<boolean>;

export interface UseCreateAtlasRevision {
  actions: CreateAtlasRevisionActions;
  status: CreateAtlasRevisionStatus;
}
