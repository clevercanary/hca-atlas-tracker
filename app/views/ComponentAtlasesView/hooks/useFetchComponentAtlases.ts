import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerComponentAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getCapIngestStatus } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useArchivedState } from "@/app/components/Entity/providers/archived/hook";
import { useFetchData } from "@/app/hooks/useFetchData";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { useResetFetchStatus } from "@/app/hooks/useResetFetchStatus";
import { useMemo } from "react";
import { AtlasIntegratedObject } from "../entities";

export const INTEGRATED_OBJECTS = "integratedObjects";

interface UseFetchComponentAtlases {
  componentAtlases?: AtlasIntegratedObject[];
}

export const useFetchComponentAtlases = (
  pathParameter: PathParameter,
): UseFetchComponentAtlases => {
  const {
    fetchDataState: { shouldFetchByKey },
  } = useFetchDataState();
  const { archivedState } = useArchivedState();
  const { archived } = archivedState;
  const shouldFetch = shouldFetchByKey[INTEGRATED_OBJECTS];

  // Validate atlasId - required for API request.
  if (!pathParameter.atlasId) throw new Error("Atlas ID is required");

  const { data, progress } = useFetchData<
    HCAAtlasTrackerComponentAtlas[] | undefined
  >(
    `${getRequestURL(
      API.ATLAS_COMPONENT_ATLASES,
      pathParameter,
    )}?archived=${archived}`,
    METHOD.GET,
    shouldFetch,
  );

  useResetFetchStatus(progress, [INTEGRATED_OBJECTS]);

  // Extract atlasId from pathParameter.
  const { atlasId } = pathParameter;

  const componentAtlases = useMemo(
    () => mapData(atlasId, data),
    [atlasId, data],
  );

  return { componentAtlases };
};

/**
 * Map HCAAtlasTrackerComponentAtlas[] to AtlasIntegratedObject[].
 * @param atlasId - Atlas ID.
 * @param data - HCAAtlasTrackerComponentAtlas[].
 * @returns AtlasIntegratedObject[].
 */
function mapData(
  atlasId: string,
  data: HCAAtlasTrackerComponentAtlas[] = [],
): AtlasIntegratedObject[] {
  return data.map((integratedObject) => ({
    ...integratedObject,
    atlasId,
    capIngestStatus: getCapIngestStatus(integratedObject),
  }));
}
