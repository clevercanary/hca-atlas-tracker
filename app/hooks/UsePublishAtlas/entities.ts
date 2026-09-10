export interface OnSubmitOptions {
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
