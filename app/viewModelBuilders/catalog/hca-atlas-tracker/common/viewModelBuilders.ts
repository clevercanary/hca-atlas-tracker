import { STATUS_BADGE_COLOR } from "@clevercanary/data-explorer-ui/lib/components/common/StatusBadge/statusBadge";
import { MetadataValue } from "@clevercanary/data-explorer-ui/lib/components/Index/components/NTagCell/nTagCell";
import { formatCountSize } from "@clevercanary/data-explorer-ui/lib/utils/formatCountSize";
import { ColumnDef } from "@tanstack/react-table";
import { NETWORKS } from "app/apis/catalog/hca-atlas-tracker/common/constants";
import { MetadataValueTuple } from "app/components/common/NTagCell/components/PinnedNTagCell/pinnedNTagCell";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../../../../site-config/hca-atlas-tracker/category";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerListAtlas,
  HCAAtlasTrackerSourceDataset,
  Network,
  NetworkKey,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import * as C from "../../../../components";
import { PLURALIZED_METADATA_LABEL } from "./constants";
import { DISEASE, METADATA_KEY } from "./entities";

/**
 * Build props for the atlas name cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildAtlasName = (
  atlas: HCAAtlasTrackerListAtlas
): React.ComponentProps<typeof C.Link> => {
  return {
    label: atlas.name,
    url: `/atlases/${encodeURIComponent(atlas.id)}/edit`,
  };
};

/**
 * Build props for the atlas title cell component.
 * @param entity - Entity.
 * @returns Props to be used for the cell.
 */
export const buildAtlasTitle = (
  entity: HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.Link> => {
  return {
    label: entity.atlasTitle,
    url: `/atlases/${encodeURIComponent(entity.atlasId)}`,
  };
};

/**
 * Build props for the biological network cell component.
 * @param entity - Entity.
 * @returns Props to be used for the cell.
 */
export const buildBioNetwork = (
  entity: HCAAtlasTrackerListAtlas | HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.BioNetworkCell> => {
  return {
    networkKey: entity.bioNetwork,
  };
};

/**
 * Build props for the cell count cell component.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildCellCount = (
  componentAtlas: HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: formatCountSize(componentAtlas.cellCount),
  };
};

/**
 * Build props for the explore cell component.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildComponentAtlasExploreLink = (
  componentAtlas: HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.Link> => {
  return {
    label: "CZ CELLxGENE",
    url: componentAtlas.cxgExploreUrl,
  };
};

/**
 * Build props for the component atlas name cell component.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildComponentAtlasName = (
  componentAtlas: HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: componentAtlas.componentAtlasName,
  };
};

/**
 * Build props for the disease cell component.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildDisease = (
  componentAtlas: HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.PinnedNTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.DISEASE),
    values: partitionMetadataValues(componentAtlas.disease, [DISEASE.NORMAL]),
  };
};

/**
 * Build props for the "in CAP" TaskCompletedIconCell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the TaskCompletedIconCell component.
 */
export const buildInCap = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.TaskCompletedIconCell> => {
  return {
    value: sourceDataset.inCap,
  };
};

/**
 * Build props for the "in CELLxGENE" TaskCompletedIconCell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the TaskCompletedIconCell component.
 */
export const buildInCellxGene = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.TaskCompletedIconCell> => {
  return {
    value: sourceDataset.inCellxGene,
  };
};

/**
 * Build props for the "in HCA data repository" TaskCompletedIconCell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the TaskCompletedIconCell component.
 */
export const buildInHcaDataRepository = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.TaskCompletedIconCell> => {
  return {
    value: sourceDataset.inHcaDataRepository,
  };
};

/**
 * Build props for the integration lead cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildIntegrationLead = (
  atlas: HCAAtlasTrackerListAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.integrationLeadName,
  };
};

/**
 * Build props for the project title cell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildProjectTitle = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.Link> => {
  return {
    label: sourceDataset.title,
    url: sourceDataset.doi
      ? `https://doi.org/${encodeURIComponent(sourceDataset.doi)}`
      : "",
  };
};

/**
 * Build props for the publication cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildPublication = (
  atlas: HCAAtlasTrackerListAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.publicationPubString,
  };
};

/**
 * Build props for the status cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildStatus = (
  atlas: HCAAtlasTrackerListAtlas
): React.ComponentProps<typeof C.StatusBadge> => {
  let color;
  switch (atlas.status) {
    case ATLAS_STATUS.DRAFT:
      color = STATUS_BADGE_COLOR.INFO;
      break;
    case ATLAS_STATUS.PUBLIC:
      color = STATUS_BADGE_COLOR.SUCCESS;
      break;
    case ATLAS_STATUS.REVISION:
      color = STATUS_BADGE_COLOR.WARNING;
      break;
  }
  return {
    color,
    label: atlas.status,
  };
};

/**
 * Build props for the tissue cell component.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildTissue = (
  componentAtlas: HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.NTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.TISSUE),
    values: componentAtlas.tissue,
  };
};

/**
 * Build props for the version cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildVersion = (
  atlas: HCAAtlasTrackerListAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.version,
  };
};

/**
 * Returns the table column definition model for the atlas (edit mode) source datasets table.
 * @returns Table column definition.
 */
export function getAtlasSourceDatasetsTableColumns(): ColumnDef<HCAAtlasTrackerSourceDataset>[] {
  return [
    getSourceDatasetProjectTitleColumnDef(),
    getSourceDatasetInHCADataRepositoryColumnDef(),
    getSourceDatasetInCELLxGENEColumnDef(),
    getSourceDatasetInCapColumnDef(),
  ];
}

/**
 * Attempts to return the bio network with the given key.
 * @param key - Bio network key.
 * @returns bio network, or undefined if not found.
 */
export function getBioNetworkByKey(key: NetworkKey): Network | undefined {
  return NETWORKS.find((network) => network.key === key);
}

/**
 * Returns the bio network name, without the suffix "Network".
 * @param name - Bio network name.
 * @returns name of the bio network.
 */
export function getBioNetworkName(name: string): string {
  return name.replace(/(\sNetwork.*)/gi, "");
}

/**
 * Returns the pluralized metadata label for the specified metadata.
 * @param metadataKey - Metadata key.
 * @returns string label describing the metadata in plural form.
 */
export function getPluralizedMetadataLabel(
  metadataKey: keyof typeof METADATA_KEY
): string {
  return PLURALIZED_METADATA_LABEL[metadataKey];
}

/**
 * Returns source dataset is in Cap column def.
 * @returns Column def.
 */
function getSourceDatasetInCapColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.IN_CAP,
    cell: ({ row }) => C.TaskCompletedIconCell(buildInCap(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.IN_CAP,
  };
}

/**
 * Returns source dataset in CELLxGENE column def.
 * @returns Column def.
 */
function getSourceDatasetInCELLxGENEColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.IN_CELLXGENE,
    cell: ({ row }) => C.TaskCompletedIconCell(buildInCellxGene(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.IN_CELLXGENE,
  };
}

/**
 * Returns source dataset in HCA data repository column def.
 * @returns Column def.
 */
function getSourceDatasetInHCADataRepositoryColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.IN_HCA_DATA_REPOSITORY,
    cell: ({ row }) =>
      C.TaskCompletedIconCell(buildInHcaDataRepository(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.IN_HCA_DATA_REPOSITORY,
  };
}

/**
 * Returns source dataset project title column def.
 * @returns Column def.
 */
function getSourceDatasetProjectTitleColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.PROJECT_TITLE,
    cell: ({ row }) => C.Link(buildProjectTitle(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PROJECT_TITLE,
  };
}

/**
 * Returns metadata values partitioned into pinned values and non-pinned values.
 * @param values - Values to partition.
 * @param pinned - Values to pin.
 * @returns metadata tuple containing pinned values and non-pinned values.
 */
function partitionMetadataValues(
  values: MetadataValue[],
  pinned: MetadataValue[]
): MetadataValueTuple {
  const partitionedValues: MetadataValueTuple = [[], []];
  return values.reduce((acc, value) => {
    if (pinned.includes(value)) {
      acc[0].push(value);
    } else {
      acc[1].push(value);
    }
    return acc;
  }, partitionedValues);
}
