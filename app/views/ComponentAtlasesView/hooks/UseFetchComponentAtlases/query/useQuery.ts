import {
  AtlasId,
  HCAAtlasTrackerComponentAtlas,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getCapIngestStatus } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "@/app/common/entities";
import { queryFn } from "@/app/query/queryFn";
import { AtlasIntegratedObject } from "@/app/views/ComponentAtlasesView/entities";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import {
  DefaultError,
  UseQueryResult,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
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
): UseQueryResult<AtlasIntegratedObject[], DefaultError> => {
  const {
    authState: { isAuthenticated },
  } = useAuth();

  return useReactQuery<
    HCAAtlasTrackerComponentAtlas[],
    DefaultError,
    AtlasIntegratedObject[],
    QueryKey
  >({
    enabled: isAuthenticated && Boolean(atlasId),
    queryFn: queryFn<HCAAtlasTrackerComponentAtlas[], QueryKey>(
      requestUrl,
      METHOD.GET,
    ),
    queryKey: [INTEGRATED_OBJECTS, atlasId, archived],
    select: (data) => (atlasId ? mapData(atlasId, data) : []),
    // The list's columns can change out-of-band, so refetch on every mount to
    // match the previous always-fresh behavior; the archive toggle invalidates
    // via the archived-scoped key change.
    staleTime: 0,
  });
};

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
