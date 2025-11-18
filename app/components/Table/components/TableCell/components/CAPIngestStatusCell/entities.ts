import { CellContext } from "@tanstack/react-table";
import { AtlasSourceDataset } from "../../../../../../views/AtlasSourceDatasetsView/entities";
import { AtlasIntegratedObject } from "../../../../../../views/ComponentAtlasesView/entities";

export enum CAP_INGEST_STATUS {
  CAP_READY = "CAP_READY",
  NEEDS_VALIDATION = "NEEDS_VALIDATION",
  NOT_REQUIRED = "NOT_REQUIRED",
  UPDATES_REQUIRED = "UPDATES_REQUIRED",
}

export type Props =
  | CellContext<AtlasIntegratedObject, unknown>
  | CellContext<AtlasSourceDataset, unknown>;
