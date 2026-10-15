import { type RequestOptions } from "@/app/common/entities";

export interface OnSubmitOptions extends Pick<
  RequestOptions,
  "invalidateQueryKeys"
> {
  onSuccess?: () => void;
}

export type OnSubmitFn = (
  requestURL: string,
  options?: OnSubmitOptions,
) => Promise<boolean>;

export interface PublishAtlasActions {
  onDismissError: () => void;
  onSubmit: OnSubmitFn;
}

export interface PublishAtlasStatus {
  error: string | undefined;
  isRequesting: boolean;
}

export interface UsePublishAtlas {
  actions: PublishAtlasActions;
  status: PublishAtlasStatus;
}
