import { IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";

export interface EditIntegratedObjectSourceDatasetsContextProps {
  onDelete: (payload?: {
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }) => Promise<void>;
}
