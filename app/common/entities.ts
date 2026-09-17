import {
  type AtlasId,
  type ComponentAtlasId,
  type EntrySheetValidationId,
  type FileId,
  type SourceDatasetId,
  type SourceStudyId,
  type UserId,
  type ValidatorName,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type QueryKey } from "@tanstack/react-query";

export enum FETCH_STATUS {
  ACCEPTED = 202,
  CREATED = 201,
  NOT_FOUND = 404,
  NOT_MODIFIED = 304,
  OK = 200,
}

export enum METHOD {
  DELETE = "DELETE",
  GET = "GET",
  PATCH = "PATCH",
  POST = "POST",
  PUT = "PUT",
}

/**
 * Query caches to invalidate on success, split by whether the request's
 * pending window waits for them.
 *
 * `awaited` holds the control disabled until those refetches land — for a
 * control that survives the success and must not be clickable against stale
 * state. `dispatched` is for cache correctness elsewhere: invalidated in the
 * same synchronous pass, but not waited on, so it can't stretch the dead
 * window to the slowest roundtrip.
 */
export interface InvalidateQueryKeys {
  awaited?: QueryKey[];
  dispatched?: QueryKey[];
}

export interface PathParameter {
  atlasId?: AtlasId;
  componentAtlasId?: ComponentAtlasId;
  entrySheetValidationId?: EntrySheetValidationId;
  fileId?: FileId;
  sourceDatasetId?: SourceDatasetId;
  sourceStudyId?: SourceStudyId;
  userId?: UserId;
  validatorName?: ValidatorName;
}

export interface PerformRequestOptions {
  isSuccessStatus?: (status: number) => boolean;
  onError: (error: Error) => void;
  onSuccess?: (res: Response) => void | Promise<unknown>;
}

/**
 * Options the request hooks accept. `onError` is supplied by the hook, and
 * `invalidateQueryKeys` is performed by it (see `onRequestSuccess`), so a call
 * site declares which caches a success refreshes rather than wiring the
 * invalidation — and its `await` — into `onSuccess` by hand.
 */
export interface RequestOptions extends Omit<PerformRequestOptions, "onError"> {
  invalidateQueryKeys?: InvalidateQueryKeys;
}

/** Signature the request hooks expose; they supply `onError` themselves. */
export type RequestFn = <P>(
  requestURL: string,
  method: METHOD,
  payload: P | undefined,
  options?: RequestOptions,
) => Promise<boolean>;
