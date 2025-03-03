import { TIER_ONE_METADATA_STATUS } from "../../app/apis/catalog/hca-atlas-tracker/common/entities";

interface CellXGeneInfo {
  collections: Record<string, CollectionInfo>;
  datasets: Record<string, DatasetInfo>;
}

interface CollectionInfo {
  datasets: string[];
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

declare const cellxgeneInfo: CellxGeneInfo;

export default cellxgeneInfo;
