import { CellContext } from "@tanstack/react-table";
import { HCAAtlasTrackerComponentAtlas } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../common/entities";
import { RouteValue } from "../../../../../../routes/entities";
import { AtlasSourceDataset } from "../../../../../../views/AtlasSourceDatasetsView/entities";

export type Props =
  | (CellContext<
      HCAAtlasTrackerComponentAtlas,
      HCAAtlasTrackerComponentAtlas["validationStatus"]
    > &
      TValue)
  | (CellContext<AtlasSourceDataset, AtlasSourceDataset["validationStatus"]> &
      TValue);

interface TValue extends PathParameter {
  validationRoute: RouteValue;
}
