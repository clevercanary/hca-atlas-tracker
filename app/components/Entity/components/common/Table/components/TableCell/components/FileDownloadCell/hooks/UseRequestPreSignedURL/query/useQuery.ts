import {
  AtlasId,
  FileId,
  PresignedUrlInfo,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { PRESIGNED_URL } from "./constants";
import { QueryKey } from "./types";

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
): UseQueryResult<PresignedUrlInfo, DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<
    PresignedUrlInfo,
    DefaultError,
    PresignedUrlInfo,
    QueryKey
  >({
    // Gate on the ids too: without them the request URL would contain the
    // literal "undefined" (getRequestURL coerces rather than throws).
    enabled: isAuthenticated && open && Boolean(atlasId) && Boolean(fileId),
    queryFn: queryFn<PresignedUrlInfo, QueryKey>(requestUrl, METHOD.POST),
    queryKey: [PRESIGNED_URL, atlasId, fileId],
    // A presigned URL is generated per request, so refetch each time the dialog
    // opens rather than serving a stale one.
    staleTime: 0,
  });
};
