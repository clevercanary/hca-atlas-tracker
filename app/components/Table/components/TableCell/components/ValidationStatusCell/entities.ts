import { CellContext } from "@tanstack/react-table";
import { HCAAtlasTrackerComponentAtlas } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasSourceDataset } from "../../../../../../views/AtlasSourceDatasetsView/entities";

export type Props =
  | (CellContext<
      HCAAtlasTrackerComponentAtlas,
      HCAAtlasTrackerComponentAtlas["validationStatus"]
    > &
      TValue)
  | (CellContext<AtlasSourceDataset, AtlasSourceDataset["validationStatus"]> &
      TValue);

interface TValue {
  validationRoute: string;
}
