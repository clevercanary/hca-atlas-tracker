import {
  type AtlasId,
  type EntrySheetValidationId,
  type HCAAtlasTrackerEntrySheetValidation,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { ENTRY_SHEET_VALIDATION } from "./constants";
import { type QueryKey } from "./types";

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
): UseQueryResult<HCAAtlasTrackerEntrySheetValidation, DefaultError> =>
  useAuthedQuery<HCAAtlasTrackerEntrySheetValidation, QueryKey>({
    enabled: Boolean(atlasId) && Boolean(entrySheetValidationId),
    queryKey: [ENTRY_SHEET_VALIDATION, atlasId, entrySheetValidationId],
    requestUrl,
    // Results change out-of-band (Sync) without invalidating this key, so
    // refetch on mount rather than contradict the post-sync list.
    staleTime: 0,
  });
