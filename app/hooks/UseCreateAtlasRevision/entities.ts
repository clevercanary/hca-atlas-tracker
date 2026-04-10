import { HCAAtlasTrackerAtlas } from "../../apis/catalog/hca-atlas-tracker/common/entities";

export type OnSubmitFn = (
  requestURL: string,
  options?: OnSubmitOptions,
) => Promise<void>;

export interface OnSubmitOptions {
  onSuccess?: (atlas: HCAAtlasTrackerAtlas) => void;
}

export interface UseCreateAtlasRevision {
  isRequesting: boolean;
  onSubmit: OnSubmitFn;
}
