import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useArchivedState } from "@/app/components/Entity/providers/archived/hook";
import { type AtlasIntegratedObject } from "@/app/views/ComponentAtlasesView/entities";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "./query/useQuery";

/**
 * Fetches the atlas's integrated objects for the given path parameter and
 * archived state via React Query. The query key is archived-scoped, so toggling
 * the archived state refetches (and caches) each variant; the archive-status
 * mutations invalidate the key.
 * @param pathParameter - Path parameter (atlas ID).
 * @returns React Query result for the integrated objects list (`data` is the mapped list).
 */
export const useFetchComponentAtlases = (
  pathParameter: PathParameter,
): UseQueryResult<AtlasIntegratedObject[], DefaultError> => {
  const {
    archivedState: { archived },
  } = useArchivedState();

  return useQuery(
    pathParameter.atlasId,
    archived,
    `${getRequestURL(API.ATLAS_COMPONENT_ATLASES, pathParameter)}?archived=${archived}`,
  );
};
