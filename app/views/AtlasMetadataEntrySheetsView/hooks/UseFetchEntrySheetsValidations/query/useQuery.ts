import {
  AtlasId,
  HCAAtlasTrackerListEntrySheetValidation,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { MetadataEntrySheet } from "@/app/views/AtlasMetadataEntrySheetsView/entities";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import { ENTRY_SHEET_VALIDATIONS } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches the atlas's entry sheet validations via React Query, mapping each to
 * the view's MetadataEntrySheet shape (adding atlasId for in-app routing).
 * @param atlasId - Atlas ID (query key).
 * @param requestUrl - Entry sheets request URL.
 * @returns Query result for the mapped entry sheets list.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  requestUrl: string,
): UseQueryResult<MetadataEntrySheet[], DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<
    HCAAtlasTrackerListEntrySheetValidation[],
    DefaultError,
    MetadataEntrySheet[],
    QueryKey
  >({
    enabled: isAuthenticated && Boolean(atlasId),
    queryFn: queryFn<HCAAtlasTrackerListEntrySheetValidation[], QueryKey>(
      requestUrl,
      METHOD.GET,
    ),
    queryKey: [ENTRY_SHEET_VALIDATIONS, atlasId],
    select: (data) => (atlasId ? mapData(atlasId, data) : []),
    // Refetch on mount to match the previous always-fresh behavior.
    staleTime: 0,
  });
};

/**
 * Maps HCAAtlasTrackerListEntrySheetValidation[] to MetadataEntrySheet[],
 * adding atlasId so table cells can build in-app routes.
 * @param atlasId - Atlas ID.
 * @param data - Entry sheet validations.
 * @returns MetadataEntrySheet[].
 */
function mapData(
  atlasId: AtlasId,
  data: HCAAtlasTrackerListEntrySheetValidation[],
): MetadataEntrySheet[] {
  return data.map((entrySheet) => ({ atlasId, ...entrySheet }));
}
