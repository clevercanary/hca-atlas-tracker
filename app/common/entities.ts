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

/**
 * Options for `performRequest`. `T` is the parsed body `parseBody` yields and
 * `onSuccess` receives; it defaults to `void` for the callers that don't parse
 * one, whose `onSuccess` is given `undefined`.
 */
export interface PerformRequestOptions<T = void> {
  isSuccessStatus?: (status: number) => boolean;
  onError: (error: Error) => void;
  onSuccess?: (res: Response, body: T) => void | Promise<unknown>;
  /**
   * Parses the success response's body. Part of determining success, unlike
   * `onSuccess`: a rejection is routed to `onError` and the request resolves
   * `false` (#1550).
   */
  parseBody?: (res: Response) => Promise<T>;
}

/**
 * Options the request hooks accept. `onError` is supplied by the hook, and
 * `invalidateQueryKeys` is performed by it (see `onRequestSuccess`), so a call
 * site declares which caches a success refreshes rather than wiring the
 * invalidation — and its `await` — into `onSuccess` by hand.
 */
export interface RequestOptions<T = void> extends Omit<
  PerformRequestOptions<T>,
  "onError"
> {
  invalidateQueryKeys?: InvalidateQueryKeys;
}

/** Signature the request hooks expose; they supply `onError` themselves. */
export type RequestFn = <P, T = void>(
  requestURL: string,
  method: METHOD,
  payload: P | undefined,
  options?: RequestOptions<T>,
) => Promise<boolean>;
