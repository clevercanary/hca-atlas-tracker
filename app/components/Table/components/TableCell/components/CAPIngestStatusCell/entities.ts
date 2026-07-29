import {
  HCAAtlasTrackerListComponentAtlas,
  HCAAtlasTrackerListSourceDataset,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { AtlasIntegratedObject } from "@/app/views/ComponentAtlasesView/entities";
import { CellContext } from "@tanstack/react-table";

export type Props =
  | CellContext<AtlasIntegratedObject, unknown>
  | CellContext<AtlasSourceDataset, unknown>
  | CellContext<HCAAtlasTrackerListComponentAtlas, unknown>
  | CellContext<HCAAtlasTrackerListSourceDataset, unknown>;
