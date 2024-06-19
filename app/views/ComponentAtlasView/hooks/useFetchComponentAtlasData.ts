import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../common/entities";
import { useFetchAtlas } from "../../../hooks/useFetchAtlas";
import { useFetchComponentAtlasSourceDatasets } from "./useFetchComponentAtlasSourceDatasets";
import { useFetchSourceStudiesSourceDatasets } from "./useFetchSourceStudiesSourceDatasets";

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
