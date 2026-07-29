import {
  HCAAtlasTrackerSourceStudy,
  SourceStudyId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { SOURCE_STUDY } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches a single source study via React Query.
 * @param sourceStudyId - Source study ID (query key).
 * @param requestUrl - Source study request URL.
 * @returns Query result for the source study.
 */
export const useQuery = (
  sourceStudyId: SourceStudyId | undefined,
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerSourceStudy, DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<
    HCAAtlasTrackerSourceStudy,
    DefaultError,
    HCAAtlasTrackerSourceStudy,
    QueryKey
  >({
    enabled: isAuthenticated && Boolean(sourceStudyId),
    queryFn: queryFn<HCAAtlasTrackerSourceStudy, QueryKey>(
      requestUrl,
      METHOD.GET,
    ),
    queryKey: [SOURCE_STUDY, sourceStudyId],
  });
};
