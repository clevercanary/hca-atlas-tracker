import { TIER_ONE_METADATA_STATUS } from "../../app/apis/catalog/hca-atlas-tracker/common/entities";

interface CollectionInfo {
  datasets: Record<string, DatasetInfo>;
  tierOneStatus: TIER_ONE_METADATA_STATUS;
}

type DatasetInfo =
  | {
      datasetVersionId: string;
      skippedReason: undefined;
      tierOneStatus: TIER_ONE_METADATA_STATUS;
    }
  | {
      datasetVersionId: null;
      skippedReason: string;
      tierOneStatus: TIER_ONE_METADATA_STATUS;
    };

declare const cellxgeneInfo: Record<string, CollectionInfo>;

export default cellxgeneInfo;
