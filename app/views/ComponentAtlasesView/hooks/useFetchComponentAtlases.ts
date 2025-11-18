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

  const componentAtlases = useMemo(() => mapData(data), [data]);

  return { componentAtlases };
};

/**
 * Map HCAAtlasTrackerComponentAtlas[] to AtlasIntegratedObject[].
 * @param data - HCAAtlasTrackerComponentAtlas[].
 * @returns AtlasIntegratedObject[].
 */
function mapData(
  data: HCAAtlasTrackerComponentAtlas[] = []
): AtlasIntegratedObject[] {
  return data.map((integratedObject) => ({
    ...integratedObject,
    capIngestStatus: getCapIngestStatus(integratedObject),
  }));
}
