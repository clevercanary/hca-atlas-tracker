import { useMemo } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useArchivedState } from "../../../components/Entity/providers/archived/hook";
import { getCapIngestStatus } from "../../../components/Table/components/TableCell/components/CAPIngestStatusCell/utils";
import { useFetchData } from "../../../hooks/useFetchData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../hooks/useResetFetchStatus";
import { AtlasIntegratedObject } from "../entities";

export const INTEGRATED_OBJECTS = "integratedObjects";

interface UseFetchComponentAtlases {
  componentAtlases?: AtlasIntegratedObject[];
}

export const useFetchComponentAtlases = (
  pathParameter: PathParameter
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
      pathParameter
    )}?archived=${archived}`,
    METHOD.GET,
    shouldFetch
  );

  useResetFetchStatus(progress, [INTEGRATED_OBJECTS]);

  // Extract atlasId from pathParameter.
  const { atlasId } = pathParameter;

  const componentAtlases = useMemo(
    () => mapData(atlasId, data),
    [atlasId, data]
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
  data: HCAAtlasTrackerComponentAtlas[] = []
): AtlasIntegratedObject[] {
  return data.map((integratedObject) => ({
    ...integratedObject,
    atlasId,
    capIngestStatus: getCapIngestStatus(integratedObject),
  }));
}
