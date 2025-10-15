import { CellContext } from "@tanstack/react-table";
import {
  FILE_VALIDATION_STATUS,
  HCAAtlasTrackerComponentAtlas,
} from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasSourceDataset } from "../../../../../../views/AtlasSourceDatasetsView/entities";

export type Props =
  | CellContext<HCAAtlasTrackerComponentAtlas, unknown>
  | CellContext<AtlasSourceDataset, unknown>;

export type CAP_INGEST_STATUS = "NOT_REQUIRED" | FILE_VALIDATION_STATUS;
