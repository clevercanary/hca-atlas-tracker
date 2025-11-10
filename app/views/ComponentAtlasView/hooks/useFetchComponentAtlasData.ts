import { useFetchAtlasSourceDatasets } from "app/views/AtlasSourceDatasetsView/hooks/useFetchAtlasSourceDatasets";
import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../common/entities";
import { useFetchAtlas } from "../../../hooks/useFetchAtlas";
import { useFetchComponentAtlasSourceDatasets } from "./useFetchComponentAtlasSourceDatasets";

interface UseFetchComponentAtlasData {
  atlas?: HCAAtlasTrackerAtlas;
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  componentAtlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const useFetchComponentAtlasData = (
  pathParameter: PathParameter
): UseFetchComponentAtlasData => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { componentAtlasSourceDatasets } =
    useFetchComponentAtlasSourceDatasets(pathParameter);
  const { atlasSourceDatasets } = useFetchAtlasSourceDatasets(pathParameter);
  return {
    atlas,
    atlasSourceDatasets,
    componentAtlasSourceDatasets,
  };
};
