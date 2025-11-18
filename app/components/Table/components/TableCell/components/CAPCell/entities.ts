import { AtlasSourceDataset } from "../../../../../../views/AtlasSourceDatasetsView/entities";
import { AtlasIntegratedObject } from "../../../../../../views/ComponentAtlasesView/entities";

export type Props =
  | Pick<AtlasIntegratedObject, "capUrl">
  | Pick<AtlasSourceDataset, "capIngestStatus" | "capUrl">;
