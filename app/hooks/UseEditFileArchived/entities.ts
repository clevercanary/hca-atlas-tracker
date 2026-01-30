export type OnSubmitFn = (
  requestURL: string,
  payload: Payload,
  options?: OnSubmitOptions,
) => Promise<void>;

export interface OnSubmitOptions {
  onSuccess?: () => void;
}

export interface Payload {
  fileIds: string[];
}

export interface UseEditFileArchived {
  onSubmit: OnSubmitFn;
}
