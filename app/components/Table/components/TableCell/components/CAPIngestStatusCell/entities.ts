import {
  type HCAAtlasTrackerListComponentAtlas,
  type HCAAtlasTrackerListSourceDataset,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { type AtlasIntegratedObject } from "@/app/views/ComponentAtlasesView/entities";
import { type CellContext } from "@tanstack/react-table";

export type Props =
  | CellContext<AtlasIntegratedObject, unknown>
  | CellContext<AtlasSourceDataset, unknown>
  | CellContext<HCAAtlasTrackerListComponentAtlas, unknown>
  | CellContext<HCAAtlasTrackerListSourceDataset, unknown>;
