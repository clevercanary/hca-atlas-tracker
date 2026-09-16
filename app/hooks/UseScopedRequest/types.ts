import { type RequestFn } from "@/app/common/entities";

export interface ScopedRequestActions {
  onRequest: RequestFn;
}

export interface UseScopedRequest {
  actions: ScopedRequestActions;
}
