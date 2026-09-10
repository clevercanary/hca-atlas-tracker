import { type RequestFn } from "@/app/common/entities";

export interface InlineRequestActions {
  onDismissError: () => void;
  onRequest: RequestFn;
}

export interface InlineRequestStatus {
  error: string | undefined;
  isRequesting: boolean;
}

export interface UseInlineRequest {
  actions: InlineRequestActions;
  status: InlineRequestStatus;
}
