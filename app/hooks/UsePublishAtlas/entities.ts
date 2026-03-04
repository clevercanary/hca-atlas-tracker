export type OnSubmitFn = (
  requestURL: string,
  options?: OnSubmitOptions,
) => Promise<void>;

export interface OnSubmitOptions {
  onSuccess?: () => void;
}

export interface UsePublishAtlas {
  onSubmit: OnSubmitFn;
}
