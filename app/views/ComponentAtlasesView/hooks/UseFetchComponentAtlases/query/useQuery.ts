import {
  AtlasId,
  HCAAtlasTrackerComponentAtlas,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getCapIngestStatus } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { useAuthedQuery } from "@/app/query/useAuthedQuery";
import { AtlasIntegratedObject } from "@/app/views/ComponentAtlasesView/entities";
import { DefaultError, UseQueryResult } from "@tanstack/react-query";
import { INTEGRATED_OBJECTS } from "./constants";
import { QueryKey } from "./types";

/**
 * Fetches the atlas's integrated objects (for the given archived state) via
 * React Query, mapping each to the view's AtlasIntegratedObject shape.
 * @param atlasId - Atlas ID (query key).
 * @param archived - Archived state (query key; the request URL is archived-scoped).
 * @param requestUrl - Component atlases request URL.
 * @returns Query result for the mapped integrated objects list.
 */
export const useQuery = (
  atlasId: AtlasId | undefined,
  archived: boolean,
  requestUrl: string,
): UseQueryResult<AtlasIntegratedObject[], DefaultError> =>
  useAuthedQuery<
    HCAAtlasTrackerComponentAtlas[],
    QueryKey,
    AtlasIntegratedObject[]
  >({
    enabled: Boolean(atlasId),
    queryKey: [INTEGRATED_OBJECTS, atlasId, archived],
    requestUrl,
    select: (data) => (atlasId ? mapData(atlasId, data) : []),
    // The list's columns can change out-of-band, so refetch on every mount to
    // match the previous always-fresh behavior; the archive toggle invalidates
    // via the archived-scoped key change.
    staleTime: 0,
  });

/**
 * Maps HCAAtlasTrackerComponentAtlas[] to AtlasIntegratedObject[].
 * @param atlasId - Atlas ID.
 * @param data - Integrated objects.
 * @returns AtlasIntegratedObject[].
 */
function mapData(
  atlasId: AtlasId,
  data: HCAAtlasTrackerComponentAtlas[],
): AtlasIntegratedObject[] {
  return data.map((integratedObject) => ({
    ...integratedObject,
    atlasId,
    capIngestStatus: getCapIngestStatus(integratedObject),
  }));
}
