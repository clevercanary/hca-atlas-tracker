import { TIER_ONE_METADATA_STATUS } from "app/apis/catalog/hca-atlas-tracker/common/entities";

interface CollectionInfo {
  datasets: Record<string, DatasetInfo>;
  tierOneStatus: TIER_ONE_METADATA_STATUS;
}

interface DatasetInfo {
  datasetVersionId: string;
  hasPrimaryData: boolean;
}

declare const cellxgeneInfo: Record<string, CollectionInfo>;

export default cellxgeneInfo;
