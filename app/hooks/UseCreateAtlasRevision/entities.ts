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

export interface OnSubmitOptions {
  onSuccess?: (atlas: HCAAtlasTrackerAtlas) => void;
}

export type OnSubmitFn = (
  requestURL: string,
  options?: OnSubmitOptions,
) => Promise<boolean>;

export interface UseCreateAtlasRevision {
  actions: CreateAtlasRevisionActions;
  status: CreateAtlasRevisionStatus;
}
