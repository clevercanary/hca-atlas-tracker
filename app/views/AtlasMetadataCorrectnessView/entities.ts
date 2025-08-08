import { RowData } from "@tanstack/react-table";
import { HCAAtlasTrackerAtlas } from "../../apis/catalog/hca-atlas-tracker/common/entities";

export type EntityData = {
  atlas: HCAAtlasTrackerAtlas | undefined;
  metadataCorrectness: RowData[] | undefined;
};
