import { type AtlasSourceDataset } from "@/app/views/AtlasSourceDatasetsView/entities";
import { type AtlasIntegratedObject } from "@/app/views/ComponentAtlasesView/entities";

export type Props =
  | Pick<AtlasIntegratedObject, "capUrl">
  | Pick<AtlasSourceDataset, "capIngestStatus" | "capUrl">;
