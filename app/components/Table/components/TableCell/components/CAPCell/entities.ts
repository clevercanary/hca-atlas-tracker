import { AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { AtlasIntegratedObject } from "@/app/views/ComponentAtlasesView/entities";

export type Props =
  | Pick<AtlasIntegratedObject, "capUrl">
  | Pick<AtlasSourceDataset, "capIngestStatus" | "capUrl">;
