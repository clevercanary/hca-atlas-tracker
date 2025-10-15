import { CellContext } from "@tanstack/react-table";
import { HCAAtlasTrackerComponentAtlas } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasSourceDataset } from "../../../../../../views/AtlasSourceDatasetsView/entities";

export enum CAP_INGEST_STATUS {
  CAP_READY = "CAP_READY",
  NEEDS_VALIDATION = "NEEDS_VALIDATION",
  NOT_REQUIRED = "NOT_REQUIRED",
  UPDATES_REQUIRED = "UPDATES_REQUIRED",
}

export type Props =
  | CellContext<HCAAtlasTrackerComponentAtlas, unknown>
  | CellContext<AtlasSourceDataset, unknown>;
