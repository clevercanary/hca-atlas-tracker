import {
  type AtlasId,
  type HCAAtlasTrackerLocalListSourceDataset,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getCapIngestStatus } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { type AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { SOURCE_DATASETS } from "./constants";
import { type QueryKey } from "./types";

/**
 * Fetches the atlas's source datasets (for the given archived state) via React
 * Query, mapping each to the view's AtlasSourceDataset shape.
 * @param atlasId - Atlas ID (query key).
 * @param archived - Archived state (query key; the request URL is archived-scoped).
 * @param requestUrl - Source datasets request URL.
 * @returns Query result for the mapped source datasets list.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  archived: boolean,
  requestUrl: string,
): UseQueryResult<AtlasSourceDataset[], DefaultError> =>
  useAuthedQuery<
    HCAAtlasTrackerLocalListSourceDataset[],
    QueryKey,
    AtlasSourceDataset[]
  >({
    enabled: Boolean(atlasId),
    queryKey: [SOURCE_DATASETS, atlasId, archived],
    requestUrl,
    select: (data) => (atlasId ? mapData(atlasId, data) : []),
    // The list's columns can change out-of-band (e.g. server-side validation),
    // so refetch on every mount to match the previous always-fresh behavior;
    // in-place edits additionally invalidate this key to refetch the mounted
    // list.
    staleTime: 0,
  });

/**
 * Maps HCAAtlasTrackerLocalListSourceDataset[] to AtlasSourceDataset[].
 * @param atlasId - Atlas ID.
 * @param data - Atlas source datasets.
 * @returns AtlasSourceDataset[].
 */
function mapData(
  atlasId: AtlasId,
  data: HCAAtlasTrackerLocalListSourceDataset[],
): AtlasSourceDataset[] {
  return data.map((atlasSourceDataset) => ({
    atlasId,
    ...atlasSourceDataset,
    capIngestStatus: getCapIngestStatus(atlasSourceDataset),
  }));
}
