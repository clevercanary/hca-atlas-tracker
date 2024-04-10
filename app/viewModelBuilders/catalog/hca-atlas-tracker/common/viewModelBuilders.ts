import { COLLATOR_CASE_INSENSITIVE } from "@clevercanary/data-explorer-ui/lib/common/constants";
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
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
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
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.Link> => {
  return {
    label: atlas.atlasName,
    url: `/atlases/${encodeURIComponent(atlas.atlasId)}/edit`,
  };
};

/**
 * Build props for DetailViewTable component from the given entity.
 * Table displays component atlases for the given atlas.
 * @param atlas - Atlas entity.
 * @returns Model to be used as props for the DetailViewTable component.
 */
export const buildAtlasDetailViewComponentAtlasesTable = (
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<
  typeof C.DetailViewTable<HCAAtlasTrackerComponentAtlas>
> => {
  const { componentAtlases } = atlas;
  return {
    Paper: C.FluidPaper,
    columns: getAtlasComponentAtlasesTableColumns(),
    gridTemplateColumns:
      "minmax(340px, 2fr) minmax(236px, 1fr) repeat(3, minmax(136px, 1fr)) minmax(100px, auto) minmax(144px, auto)",
    items: componentAtlases.sort(sortComponentAtlases),
    noResultsTitle: "No Component Atlases",
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
  entity: HCAAtlasTrackerAtlas | HCAAtlasTrackerComponentAtlas
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
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.integrationLead,
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
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.publication,
  };
};

/**
 * Build props for the status cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildStatus = (
  atlas: HCAAtlasTrackerAtlas
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
  atlas: HCAAtlasTrackerAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.version,
  };
};

/**
 * Returns source dataset or component atlas' atlas title column def.
 * @returns Column def.
 */
function getAtlasAtlasTitleColumnDef(): ColumnDef<HCAAtlasTrackerComponentAtlas> {
  return {
    accessorKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_TITLE,
    cell: ({ row }) => C.Link(buildAtlasTitle(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_TITLE,
  };
}

/**
 * Returns source dataset or component atlas' biological network column def.
 * @returns Column def.
 */
function getAtlasBiologicalNetworkColumnDef(): ColumnDef<HCAAtlasTrackerComponentAtlas> {
  return {
    accessorKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.BIONETWORK,
    cell: ({ row }) => C.BioNetworkCell(buildBioNetwork(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.BIONETWORK,
  };
}

/**
 * Returns the table column definition model for the atlas component atlases table.
 * @returns Table column definition.
 */
function getAtlasComponentAtlasesTableColumns(): ColumnDef<HCAAtlasTrackerComponentAtlas>[] {
  return [
    getComponentAtlasAtlasNameColumnDef(),
    getAtlasAtlasTitleColumnDef() as ColumnDef<HCAAtlasTrackerComponentAtlas>,
    getAtlasBiologicalNetworkColumnDef() as ColumnDef<HCAAtlasTrackerComponentAtlas>,
    getComponentAtlasTissueColumnDef(),
    getComponentAtlasDiseaseColumnDef(),
    getComponentAtlasCellCountColumnDef(),
    getComponentAtlasExploreColumnDef(),
  ];
}

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
 * Returns component atlas' atlas name column def.
 * @returns Column def.
 */
function getComponentAtlasAtlasNameColumnDef(): ColumnDef<HCAAtlasTrackerComponentAtlas> {
  return {
    accessorKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.COMPONENT_ATLAS_NAME,
    cell: ({ row }) => C.Cell(buildComponentAtlasName(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.COMPONENT_ATLAS_NAME,
  };
}

/**
 * Returns component atlas' cell count column def.
 * @returns Column def.
 */
function getComponentAtlasCellCountColumnDef(): ColumnDef<HCAAtlasTrackerComponentAtlas> {
  return {
    accessorKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.CELL_COUNT,
    cell: ({ row }) => C.Cell(buildCellCount(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.CELL_COUNT,
  };
}

/**
 * Returns component atlas' disease column def.
 * @returns Column def.
 */
function getComponentAtlasDiseaseColumnDef(): ColumnDef<HCAAtlasTrackerComponentAtlas> {
  return {
    accessorKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DISEASE,
    cell: ({ row }) => C.PinnedNTagCell(buildDisease(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DISEASE,
  };
}

/**
 * Returns component atlas' explore column def.
 * @returns Column def.
 */
function getComponentAtlasExploreColumnDef(): ColumnDef<HCAAtlasTrackerComponentAtlas> {
  return {
    accessorKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.CXG_EXPLORE_URL,
    cell: ({ row }) => C.Link(buildComponentAtlasExploreLink(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.CXG_EXPLORE_URL,
  };
}

/**
 * Returns component atlas' tissue column def.
 * @returns Column def.
 */
function getComponentAtlasTissueColumnDef(): ColumnDef<HCAAtlasTrackerComponentAtlas> {
  return {
    accessorKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TISSUE,
    cell: ({ row }) => C.NTagCell(buildTissue(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TISSUE,
  };
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

/**
 * Sort component atlases by atlas name, ascending.
 * @param a0 - First component atlas to compare.
 * @param a1 - Second component atlas to compare.
 * @returns Number indicating sort precedence of a0 vs a1.
 */
function sortComponentAtlases(
  a0: HCAAtlasTrackerComponentAtlas,
  a1: HCAAtlasTrackerComponentAtlas
): number {
  return COLLATOR_CASE_INSENSITIVE.compare(
    a0.componentAtlasName,
    a1.componentAtlasName
  );
}
