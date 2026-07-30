import {
  AtlasId,
  EntrySheetValidationId,
  HCAAtlasTrackerEntrySheetValidation,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { ENTRY_SHEET_VALIDATION } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches the entry sheet validation via React Query.
 * @param atlasId - Atlas ID (query key).
 * @param entrySheetValidationId - Entry sheet validation ID (query key).
 * @param requestUrl - Entry sheet validation request URL.
 * @returns Query result for the entry sheet validation.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  entrySheetValidationId: EntrySheetValidationId | undefined,
  requestUrl: string,
): UseQueryResult<HCAAtlasTrackerEntrySheetValidation, DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<
    HCAAtlasTrackerEntrySheetValidation,
    DefaultError,
    HCAAtlasTrackerEntrySheetValidation,
    QueryKey
  >({
    enabled:
      isAuthenticated && Boolean(atlasId) && Boolean(entrySheetValidationId),
    queryFn: queryFn<HCAAtlasTrackerEntrySheetValidation, QueryKey>(
      requestUrl,
      METHOD.GET,
    ),
    queryKey: [ENTRY_SHEET_VALIDATION, atlasId, entrySheetValidationId],
  });
};
