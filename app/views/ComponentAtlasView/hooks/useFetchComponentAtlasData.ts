import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../common/entities";
import { useFetchAtlas } from "../../../hooks/useFetchAtlas";
import { useFetchSourceStudiesSourceDatasets } from "../../../hooks/useFetchSourceStudiesSourceDatasets";
import { useFetchComponentAtlasSourceDatasets } from "./useFetchComponentAtlasSourceDatasets";

interface UseFetchComponentAtlasData {
  atlas?: HCAAtlasTrackerAtlas;
  componentAtlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  sourceStudiesSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const useFetchComponentAtlasData = (
  pathParameter: PathParameter
): UseFetchComponentAtlasData => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { componentAtlasSourceDatasets } =
    useFetchComponentAtlasSourceDatasets(pathParameter);
  const sourceStudiesSourceDatasets =
    useFetchSourceStudiesSourceDatasets(pathParameter);
  return {
    atlas,
    componentAtlasSourceDatasets,
    sourceStudiesSourceDatasets,
  };
};
