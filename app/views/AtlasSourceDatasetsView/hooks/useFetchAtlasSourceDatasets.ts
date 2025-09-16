import { useMemo } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useFetchData } from "../../../hooks/useFetchData";

interface UseFetchAtlasSourceDatasets {
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const useFetchAtlasSourceDatasets = (
  pathParameter: PathParameter
): UseFetchAtlasSourceDatasets => {
  // Validate atlasId - required for API request.
  if (!pathParameter.atlasId) throw new Error("Atlas ID is required");

  const { data } = useFetchData<HCAAtlasTrackerSourceDataset[] | undefined>(
    getRequestURL(API.ATLAS_SOURCE_DATASETS, pathParameter),
    METHOD.GET
  );

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
