import { CellContext } from "@tanstack/react-table";
import {
  HCAAtlasTrackerListComponentAtlas,
  HCAAtlasTrackerListSourceDataset,
} from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasSourceDataset } from "../../../../../../views/AtlasSourceDatasetsView/entities";
import { AtlasIntegratedObject } from "../../../../../../views/ComponentAtlasesView/entities";

export type Props =
  | CellContext<AtlasIntegratedObject, unknown>
  | CellContext<AtlasSourceDataset, unknown>
  | CellContext<HCAAtlasTrackerListComponentAtlas, unknown>
  | CellContext<HCAAtlasTrackerListSourceDataset, unknown>;
