import { type HCAAtlasTrackerDetailComponentAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";

export interface EditIntegratedObjectSourceDatasetsContextProps {
  integratedObjectTitle: HCAAtlasTrackerDetailComponentAtlas["title"];
  onDelete: (payload?: {
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }) => Promise<boolean>;
}
