import { IntegratedObjectSourceDataset } from "../../entities";

export interface EditIntegratedObjectSourceDatasetsContextProps {
  onDelete: (payload?: {
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }) => Promise<void>;
}
