import {
  HCAAtlasTrackerListComponentAtlas,
  HCAAtlasTrackerListSourceDataset,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { BackOrigin } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/constants";
import { RouteValue } from "@/app/routes/entities";
import { AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { AtlasIntegratedObject } from "@/app/views/ComponentAtlasesView/entities";
import { CellContext } from "@tanstack/react-table";

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
