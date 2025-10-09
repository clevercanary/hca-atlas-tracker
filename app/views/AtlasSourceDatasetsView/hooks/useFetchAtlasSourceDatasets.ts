import { useMemo } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useArchivedState } from "../../../components/Entity/providers/archived/hook";
import { useFetchData } from "../../../hooks/useFetchData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../hooks/useResetFetchStatus";
import { AtlasSourceDataset } from "../entities";

interface UseFetchAtlasSourceDatasets {
  atlasSourceDatasets?: AtlasSourceDataset[];
}

export const useFetchAtlasSourceDatasets = (
  pathParameter: PathParameter
): UseFetchAtlasSourceDatasets => {
  const {
    fetchDataState: { shouldFetch },
  } = useFetchDataState();
  const { archivedState } = useArchivedState();
  const { archived } = archivedState;

  // Validate atlasId - required for API request.
  if (!pathParameter.atlasId) throw new Error("Atlas ID is required");

  const { data, progress } = useFetchData<
    HCAAtlasTrackerSourceDataset[] | undefined
  >(
    `${getRequestURL(
      API.ATLAS_SOURCE_DATASETS,
      pathParameter
    )}?archived=${archived}`,
    METHOD.GET,
    shouldFetch
  );

  useResetFetchStatus(progress);

  // Extract atlasId from pathParameter.
  const { atlasId } = pathParameter;

  // Augment each atlas source dataset with the current atlasId.
  // This enables in-app routing and ensures atlasId is always present in table cell data.
  const atlasSourceDatasets = useMemo(
    () =>
      data?.map((atlasSourceDataset) => ({ atlasId, ...atlasSourceDataset })),
    [atlasId, data]
  );

  return { atlasSourceDatasets };
};
