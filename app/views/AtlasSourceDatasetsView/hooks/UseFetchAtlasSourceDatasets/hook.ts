import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useArchivedState } from "@/app/components/Entity/providers/archived/hook";
import { type AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the atlas's source datasets for the given path parameter and archived
 * state via React Query. The query key is archived-scoped, so toggling the
 * archived state refetches (and caches) each variant; in-place edits invalidate
 * the key at their mutation sites.
 * @param pathParameter - Path parameter (atlas ID).
 * @returns React Query result for the source datasets list (`data` is the mapped list).
 */
export const useFetchAtlasSourceDatasets = (
  pathParameter: PathParameter,
): UseQueryResult<AtlasSourceDataset[], DefaultError> => {
  const {
    archivedState: { archived },
  } = useArchivedState();

  return useQuery(
    pathParameter.atlasId,
    archived,
    `${getRequestURL(API.ATLAS_SOURCE_DATASETS, pathParameter)}?archived=${archived}`,
  );
};
