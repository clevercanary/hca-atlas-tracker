export type OnSubmitFn = (
  requestURL: string,
  payload: Payload,
  options?: OnSubmitOptions,
) => Promise<boolean>;

export interface OnSubmitOptions {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export interface Payload {
  fileIds: string[];
}

export interface UseEditFileArchived {
  onSubmit: OnSubmitFn;
}
