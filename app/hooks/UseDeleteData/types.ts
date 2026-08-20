import { type PerformRequestOptions } from "@/app/common/entities";

export interface UseDeleteData<T> {
  onDelete: (payload?: T) => Promise<boolean>;
}

export type UseDeleteDataOptions = PerformRequestOptions;
