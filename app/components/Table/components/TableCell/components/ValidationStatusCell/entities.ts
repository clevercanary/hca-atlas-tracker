import { CellContext } from "@tanstack/react-table";
import {
  HCAAtlasTrackerListComponentAtlas,
  HCAAtlasTrackerListSourceDataset,
} from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../common/entities";
import { RouteValue } from "../../../../../../routes/entities";
import { AtlasSourceDataset } from "../../../../../../views/AtlasSourceDatasetsView/entities";
import { AtlasIntegratedObject } from "../../../../../../views/ComponentAtlasesView/entities";
import { BackOrigin } from "../../../../../Layout/components/Detail/components/DetailViewHero/components/BackButton/constants";

export type Props =
  | (CellContext<
      AtlasIntegratedObject,
      AtlasIntegratedObject["validationStatus"]
    > &
      TValue)
  | (CellContext<AtlasSourceDataset, AtlasSourceDataset["validationStatus"]> &
      TValue)
  | (CellContext<
      HCAAtlasTrackerListSourceDataset,
      HCAAtlasTrackerListSourceDataset["validationStatus"]
    > &
      TValue)
  | (CellContext<
      HCAAtlasTrackerListComponentAtlas,
      HCAAtlasTrackerListComponentAtlas["validationStatus"]
    > &
      TValue);

interface TValue extends PathParameter {
  backOrigin: BackOrigin;
  validationRoute: RouteValue;
}
