import { STATUS_BADGE_COLOR } from "@clevercanary/data-explorer-ui/lib/components/common/StatusBadge/statusBadge";
import { ColumnDef } from "@tanstack/react-table";
import { NETWORKS } from "app/apis/catalog/hca-atlas-tracker/common/constants";
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
  PUBLICATION_STATUS,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import * as C from "../../../../components";

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
 * Build props for the "in CAP" TaskCompletedIconCell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the TaskCompletedIconCell component.
 */
export const buildInCap = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.TaskStatusCell> => {
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
): React.ComponentProps<typeof C.TaskStatusCell> => {
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
): React.ComponentProps<typeof C.TaskStatusCell> => {
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
    value: atlas.integrationLeadName ?? "",
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
  const { doi, title } = sourceDataset;
  return {
    label: title,
    url: getDOILink(doi),
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
 * Build props for the source dataset publication Link component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the Link component.
 */
export const buildSourceDatasetPublication = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.Link> => {
  const {
    doi,
    firstAuthorPrimaryName,
    journal,
    publicationDate,
    publicationStatus,
  } = sourceDataset;
  return {
    label: getCitation(
      publicationStatus,
      firstAuthorPrimaryName,
      publicationDate,
      journal
    ),
    url: getDOILink(doi),
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
 * Build props for the wave cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildWave = (
  atlas: HCAAtlasTrackerListAtlas
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: atlas.wave,
  };
};

/**
 * Returns the table column definition model for the atlas (edit mode) source datasets table.
 * @returns Table column definition.
 */
export function getAtlasSourceDatasetsTableColumns(): ColumnDef<HCAAtlasTrackerSourceDataset>[] {
  return [
    getSourceDatasetProjectTitleColumnDef(),
    getSourceDatasetPublicationColumnDef(),
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
 * Returns the DOI link.
 * @param doi - DOI.
 * @returns DOI link.
 */
function getDOILink(doi: string | null): string {
  if (!doi) return "";
  return `https://doi.org/${encodeURIComponent(doi)}`;
}

function getCitation(
  publicationStatus: PUBLICATION_STATUS,
  author: string | null,
  date: string | null,
  journal: string | null
): string {
  if (publicationStatus === PUBLICATION_STATUS.DOI_NOT_ON_CROSSREF)
    return "Unpublished";
  const citation = [];
  if (author) {
    citation.push(author);
  }
  if (date) {
    const [year] = date.split("-");
    citation.push(`(${year})`);
  }
  if (journal) {
    citation.push(journal);
  }
  return citation.join(" ");
}

/**
 * Returns source dataset is in Cap column def.
 * @returns Column def.
 */
function getSourceDatasetInCapColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.IN_CAP,
    cell: ({ row }) => C.TaskStatusCell(buildInCap(row.original)),
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
    cell: ({ row }) => C.TaskStatusCell(buildInCellxGene(row.original)),
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
    cell: ({ row }) => C.TaskStatusCell(buildInHcaDataRepository(row.original)),
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
 * Returns source dataset publication column def.
 * @returns Column def.
 */
function getSourceDatasetPublicationColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "publication", // TODO confirm accessor key.
    cell: ({ row }) => C.Link(buildSourceDatasetPublication(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION,
  };
}
