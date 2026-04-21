import { CellContext } from "@tanstack/react-table";
import { AtlasSourceDataset } from "../../../../../../views/AtlasSourceDatasetsView/entities";
import { AtlasIntegratedObject } from "../../../../../../views/ComponentAtlasesView/entities";

export enum CAP_INGEST_STATUS {
  CAP_READY = "CAP_READY",
  CAP_VALIDATION_FAILED = "CAP_VALIDATION_FAILED",
  INFO_REQUIRED = "INFO_REQUIRED",
  NEEDS_VALIDATION = "NEEDS_VALIDATION",
  NOT_REQUIRED = "NOT_REQUIRED",
}

export type Props =
  | CellContext<AtlasIntegratedObject, unknown>
  | CellContext<AtlasSourceDataset, unknown>;
