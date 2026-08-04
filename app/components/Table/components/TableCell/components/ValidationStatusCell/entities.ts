import {
  type HCAAtlasTrackerListComponentAtlas,
  type HCAAtlasTrackerListSourceDataset,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { type BackOrigin } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/constants";
import { type RouteValue } from "@/app/routes/entities";
import { type AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { type AtlasIntegratedObject } from "@/app/views/ComponentAtlasesView/entities";
import { type CellContext } from "@tanstack/react-table";

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
