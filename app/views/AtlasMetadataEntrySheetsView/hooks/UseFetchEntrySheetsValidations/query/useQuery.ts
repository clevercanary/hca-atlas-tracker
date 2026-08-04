import {
  type AtlasId,
  type HCAAtlasTrackerListEntrySheetValidation,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { type MetadataEntrySheet } from "@/app/views/AtlasMetadataEntrySheetsView/entities";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { ENTRY_SHEET_VALIDATIONS } from "./constants";
import { type QueryKey } from "./types";

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
): UseQueryResult<MetadataEntrySheet[], DefaultError> =>
  useAuthedQuery<
    HCAAtlasTrackerListEntrySheetValidation[],
    QueryKey,
    MetadataEntrySheet[]
  >({
    enabled: Boolean(atlasId),
    queryKey: [ENTRY_SHEET_VALIDATIONS, atlasId],
    requestUrl,
    select: (data) => (atlasId ? mapData(atlasId, data) : []),
    // Refetch on mount to match the previous always-fresh behavior.
    staleTime: 0,
  });

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
