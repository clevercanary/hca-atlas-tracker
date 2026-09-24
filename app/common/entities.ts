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
 * Options for a request whose success body the caller doesn't read:
 * `onSuccess` takes no body.
 */
export interface BodylessRequestOptions {
  onSuccess?: () => void | Promise<unknown>;
  parseBody?: undefined;
}

/**
 * Options for a request whose success body the caller reads: `onSuccess`
 * receives what `parseBody` resolved to.
 */
export interface ParsedBodyRequestOptions<T> {
  onSuccess?: (body: T) => void | Promise<unknown>;
  /**
   * Parses the success response's body. Part of determining success, unlike
   * `onSuccess`: a rejection is routed to `onError` and the request resolves
   * `false` (#1550). The rejection's message is what the user is shown, so a
   * parser for a request that has already taken effect should say so.
   */
  parseBody: (res: Response) => Promise<T>;
}

/** Options for `performRequest`, apart from how the success body is read. */
export interface PerformRequestBaseOptions {
  isSuccessStatus?: (status: number) => boolean;
  /**
   * Runs as soon as the status shows the server accepted the request, before
   * the body is parsed, so it runs whether or not the body can be read: for
   * effects a committed mutation needs either way, such as the request hooks'
   * cache invalidations. Called synchronously at that point, and awaited
   * before the request resolves on either outcome.
   */
  onCommitted?: () => void | Promise<unknown>;
  onError: (error: Error) => void;
}

/**
 * Options for `performRequest`. The two body shapes are kept apart so the body
 * `onSuccess` receives is always one `parseBody` produced: a callback that
 * takes a body without a parser to supply it doesn't type-check.
 */
export type PerformRequestOptions<T = void> = PerformRequestBaseOptions &
  RequestBodyOptions<T>;

/** How a request's success body is read; see `PerformRequestOptions`. */
export type RequestBodyOptions<T> =
  | BodylessRequestOptions
  | ParsedBodyRequestOptions<T>;

/**
 * Options the request hooks accept. `onError` is supplied by the hook, and
 * `invalidateQueryKeys` is performed by it (see `invalidateQueryCaches`), so a
 * call site declares which caches a success refreshes rather than wiring the
 * invalidation — and its `await` — into `onSuccess` by hand.
 */
export type RequestOptions<T = void> = RequestBaseOptions &
  RequestBodyOptions<T>;

/** Options the request hooks accept, apart from how the success body is read. */
export interface RequestBaseOptions extends Pick<
  PerformRequestBaseOptions,
  "isSuccessStatus"
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
