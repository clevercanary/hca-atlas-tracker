import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../common/entities";
import { useFetchAtlas } from "../../../hooks/useFetchAtlas";
import { useFetchSourceStudiesSourceDatasets } from "../../../views/ComponentAtlasView/hooks/useFetchSourceStudiesSourceDatasets";
import { useFetchAtlasSourceDatasets } from "./useFetchAtlasSourceDatasets";

interface UseFetchAtlasSourceDatasetsData {
  atlas?: HCAAtlasTrackerAtlas;
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  sourceStudiesSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const useFetchAtlasSourceDatasetsData = (
  pathParameter: PathParameter
): UseFetchAtlasSourceDatasetsData => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { atlasSourceDatasets } = useFetchAtlasSourceDatasets(pathParameter);
  const sourceStudiesSourceDatasets =
    useFetchSourceStudiesSourceDatasets(pathParameter);
  return {
    atlas,
    atlasSourceDatasets,
    sourceStudiesSourceDatasets,
  };
};
