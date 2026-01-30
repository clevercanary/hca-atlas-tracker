import { useMemo } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useArchivedState } from "../../../components/Entity/providers/archived/hook";
import { getCapIngestStatus } from "../../../components/Table/components/TableCell/components/CAPIngestStatusCell/utils";
import { useFetchData } from "../../../hooks/useFetchData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../hooks/useResetFetchStatus";
import { AtlasSourceDataset } from "../entities";

export const SOURCE_DATASETS = "sourceDatasets";

interface UseFetchAtlasSourceDatasets {
  atlasSourceDatasets?: AtlasSourceDataset[];
}

export const useFetchAtlasSourceDatasets = (
  pathParameter: PathParameter,
): UseFetchAtlasSourceDatasets => {
  const {
    fetchDataState: { shouldFetchByKey },
  } = useFetchDataState();
  const { archivedState } = useArchivedState();
  const { archived } = archivedState;
  const shouldFetch = shouldFetchByKey[SOURCE_DATASETS];

  // Validate atlasId - required for API request.
  if (!pathParameter.atlasId) throw new Error("Atlas ID is required");

  const { data, progress } = useFetchData<
    HCAAtlasTrackerSourceDataset[] | undefined
  >(
    `${getRequestURL(
      API.ATLAS_SOURCE_DATASETS,
      pathParameter,
    )}?archived=${archived}`,
    METHOD.GET,
    shouldFetch,
  );

  useResetFetchStatus(progress, [SOURCE_DATASETS]);

  // Extract atlasId from pathParameter.
  const { atlasId } = pathParameter;

  const atlasSourceDatasets = useMemo(
    () => mapData(atlasId, data),
    [atlasId, data],
  );

  return { atlasSourceDatasets };
};

/**
 * Map HCAAtlasTrackerSourceDataset[] to AtlasSourceDataset[].
 * @param atlasId - Atlas ID.
 * @param data - Atlas source datasets.
 * @returns AtlasSourceDataset[].
 */
function mapData(
  atlasId: string,
  data: HCAAtlasTrackerSourceDataset[] = [],
): AtlasSourceDataset[] {
  return data.map((atlasSourceDataset) => ({
    atlasId,
    ...atlasSourceDataset,
    capIngestStatus: getCapIngestStatus(atlasSourceDataset),
  }));
}
