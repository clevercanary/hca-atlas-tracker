export type OnSubmitFn = (
  requestURL: string,
  payload: Payload,
  options?: OnSubmitOptions,
) => Promise<boolean>;

export interface OnSubmitOptions {
  onSuccess?: () => void | Promise<unknown>;
}

export interface Payload {
  fileIds: string[];
}

export interface UseEditFileArchived {
  isRequesting: boolean;
  onSubmit: OnSubmitFn;
}
