import { TIER_ONE_METADATA_STATUS } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { isTierOneMetadataStatus } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import savedCellxGeneInfo from "@/catalog/output/cellxgene-info.json";

interface DatasetInfo {
  tierOneStatus: string;
}

const datasetsInfo: Partial<Record<string, DatasetInfo>> =
  savedCellxGeneInfo["datasets"];

export const TIER_ONE_METADATA_STATUS_BY_CELLXGENE_COLLECTION_ID =
  getCellxGeneCollectionsTierOneMetadataStatuses();

function getCellxGeneCollectionsTierOneMetadataStatuses(): Map<
  string,
  TIER_ONE_METADATA_STATUS
> {
  return new Map(
    Object.entries(savedCellxGeneInfo.collections).map(
      ([collectionId, collectionInfo]) => [
        collectionId,
        getCompositeTierOneMetadataStatus(
          collectionInfo.datasets.map(getCellxGeneDatasetTierOneMetadataStatus),
        ),
      ],
    ),
  );
}

/**
 * Get the Tier 1 metadata status of the CELLxGENE dataset with the given ID.
 * @param cellxgeneDatasetId - CELLxGENE dataset ID.
 * @returns Tier 1 metadata status.
 */
function getCellxGeneDatasetTierOneMetadataStatus(
  cellxgeneDatasetId: string,
): TIER_ONE_METADATA_STATUS {
  const datasetInfo = datasetsInfo[cellxgeneDatasetId];
  if (datasetInfo === undefined)
    return TIER_ONE_METADATA_STATUS.NEEDS_VALIDATION;
  const { tierOneStatus } = datasetInfo;
  if (isTierOneMetadataStatus(tierOneStatus)) return tierOneStatus;
  throw new Error(
    `Invalid Tier 1 metadata status in saved CELLxGENE info: ${JSON.stringify(tierOneStatus)}`,
  );
}

/**
 * Combine the given Tier 1 metadata statuses into one.
 * @param statuses - Tier 1 metadata statuses.
 * @returns Tier 1 metadata status.
 */
function getCompositeTierOneMetadataStatus(
  statuses: TIER_ONE_METADATA_STATUS[],
): TIER_ONE_METADATA_STATUS {
  let prevStatus: TIER_ONE_METADATA_STATUS | null = null;
  for (const status of statuses) {
    if (status === TIER_ONE_METADATA_STATUS.NA) continue;
    if (status === TIER_ONE_METADATA_STATUS.NEEDS_VALIDATION) return status;
    if (
      status === TIER_ONE_METADATA_STATUS.INCOMPLETE ||
      (prevStatus && prevStatus !== status)
    ) {
      return TIER_ONE_METADATA_STATUS.INCOMPLETE;
    }
    prevStatus = status;
  }
  return prevStatus ?? TIER_ONE_METADATA_STATUS.NA;
}
