import {
  type AtlasId,
  type FileId,
  type PresignedUrlInfo,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { PRESIGNED_URL } from "./constants";
import { type QueryKey } from "./types";

/**
 * Requests a presigned download URL for a file via React Query. Gated on
 * `enabled` (the dialog being open) so the URL is only generated when the
 * download dialog opens, not for every file cell on the page.
 * @param atlasId - Atlas ID (query key).
 * @param fileId - File ID (query key).
 * @param open - Whether the download dialog is open (gates the request).
 * @param requestUrl - Presigned URL request URL.
 * @returns Query result for the presigned URL info.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  fileId: FileId | undefined,
  open: boolean,
  requestUrl: string,
): UseQueryResult<PresignedUrlInfo, DefaultError> =>
  useAuthedQuery<PresignedUrlInfo, QueryKey>({
    // Gate on the ids too: without them the request URL would contain the
    // literal "undefined" (getRequestURL coerces rather than throws).
    enabled: open && Boolean(atlasId) && Boolean(fileId),
    method: METHOD.POST,
    queryKey: [PRESIGNED_URL, atlasId, fileId],
    // A presigned URL stays valid for ~48h, so there's no need to refetch it on
    // network reconnect while the dialog is open — doing so would flip
    // `isFetching` true and momentarily hide the already-valid URL (the Dialog
    // gates display on `!isFetching`). The only intended refetch is on reopen,
    // which the `enabled` transition drives with `staleTime: 0` below.
    refetchOnReconnect: false,
    requestUrl,
    // A presigned URL is generated per request, so refetch each time the dialog
    // opens rather than serving a stale one.
    staleTime: 0,
  });
