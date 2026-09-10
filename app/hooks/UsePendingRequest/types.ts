import { type RequestFn } from "@/app/common/entities";

export interface UsePendingRequest {
  isRequesting: boolean;
  onRequest: RequestFn;
}
