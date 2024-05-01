import { STATUS_BADGE_COLOR } from "@databiosphere/findable-ui/lib/components/common/StatusBadge/statusBadge";
import { ColumnDef } from "@tanstack/react-table";
import { NETWORKS } from "app/apis/catalog/hca-atlas-tracker/common/constants";
import { HCA_ATLAS_TRACKER_CATEGORY_LABEL } from "../../../../../site-config/hca-atlas-tracker/category";
import {
  AtlasId,
  ATLAS_STATUS,
  DOI_STATUS,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerListAtlas,
  HCAAtlasTrackerSourceDataset,
  Network,
  NetworkKey,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getRouteURL } from "../../../../common/utils";
import * as C from "../../../../components";
import { TASK_STATUS } from "../../../../components/Index/components/Table/components/TaskStatusCell/taskStatusCell";
import { ROUTE } from "../../../../routes/constants";

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
    value: getSourceDatasetInCap(sourceDataset),
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
    value: getSourceDatasetInCellxGene(sourceDataset),
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
    value: getSourceDatasetInHcaDataRepository(sourceDataset),
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
  const { doi } = sourceDataset;
  return {
    label: getSourceDatasetCitation(sourceDataset),
    url: getDOILink(doi),
  };
};

/**
 * Build props for the source dataset title Link component.
 * @param atlasId - Atlas ID.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the Link component.
 */
export const buildSourceDatasetTitle = (
  atlasId: AtlasId,
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.Link> => {
  const { id, title } = sourceDataset;
  return {
    label: title ?? id,
    url: getRouteURL(ROUTE.EDIT_ATLAS_SOURCE_DATASET, atlasId, id),
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
 * @param atlasId - Atlas ID.
 * @returns Table column definition.
 */
export function getAtlasSourceDatasetsTableColumns(
  atlasId: AtlasId
): ColumnDef<HCAAtlasTrackerSourceDataset>[] {
  return [
    getSourceDatasetTitleColumnDef(atlasId),
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

function getPublishedCitation(
  doiStatus: DOI_STATUS,
  author: string | null,
  date: string | null,
  journal: string | null
): string {
  if (doiStatus !== DOI_STATUS.OK) return "Unpublished";
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

function getUnpublishedCitation(author: string, email: string | null): string {
  return email
    ? `${author}, ${email} - Unpublished`
    : `${author} - Unpublished`;
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

/**
 * Returns the source dataset citation.
 * @param sourceDataset - Source dataset.
 * @returns Source dataset citation.
 */
export function getSourceDatasetCitation(
  sourceDataset?: HCAAtlasTrackerSourceDataset
): string {
  if (!sourceDataset) return "";
  if (sourceDataset.doi === null) {
    const { contactEmail, referenceAuthor } = sourceDataset;
    return getUnpublishedCitation(referenceAuthor, contactEmail);
  } else {
    const { doiStatus, journal, publicationDate, referenceAuthor } =
      sourceDataset;
    return getPublishedCitation(
      doiStatus,
      referenceAuthor,
      publicationDate,
      journal
    );
  }
}

/**
 * Returns source dataset is in Cap column def.
 * @returns Column def.
 */
function getSourceDatasetInCapColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorFn: getSourceDatasetInCap,
    cell: ({ row }) => C.TaskStatusCell(buildInCap(row.original)),
    header: "CAP",
  };
}

/**
 * Returns source dataset in CELLxGENE column def.
 * @returns Column def.
 */
function getSourceDatasetInCELLxGENEColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorFn: getSourceDatasetInCellxGene,
    cell: ({ row }) => C.TaskStatusCell(buildInCellxGene(row.original)),
    header: "CELLxGENE",
  };
}

/**
 * Returns source dataset in HCA data repository column def.
 * @returns Column def.
 */
function getSourceDatasetInHCADataRepositoryColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorFn: getSourceDatasetInHcaDataRepository,
    cell: ({ row }) => C.TaskStatusCell(buildInHcaDataRepository(row.original)),
    header: "HCA Data Repository",
  };
}

/**
 * Get task status describing whether a source dataset is known to be in CAP.
 * @param sourceDataset - Source dataset.
 * @returns whether the source dataset is in CAP.
 */
function getSourceDatasetInCap(
  sourceDataset: HCAAtlasTrackerSourceDataset
): TASK_STATUS {
  return sourceDataset.capId ? TASK_STATUS.DONE : TASK_STATUS.REQUIRED;
}

/**
 * Get task status describing whether a source dataset is known to be in CELLxGENE.
 * @param sourceDataset - Source dataset.
 * @returns whether the source dataset is in CELLxGENE.
 */
function getSourceDatasetInCellxGene(
  sourceDataset: HCAAtlasTrackerSourceDataset
): TASK_STATUS {
  return sourceDataset.cellxgeneCollectionId
    ? TASK_STATUS.DONE
    : TASK_STATUS.REQUIRED;
}

/**
 * Get task status describing whether a source dataset is known to be in the HCA data repository.
 * @param sourceDataset - Source dataset.
 * @returns whether the source dataset is in the HCA data repository.
 */
function getSourceDatasetInHcaDataRepository(
  sourceDataset: HCAAtlasTrackerSourceDataset
): TASK_STATUS {
  return sourceDataset.hcaProjectId ? TASK_STATUS.DONE : TASK_STATUS.REQUIRED;
}

/**
 * Returns source dataset publication column def.
 * @returns Column def.
 */
function getSourceDatasetPublicationColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "publication",
    cell: ({ row }) => C.Link(buildSourceDatasetPublication(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION,
  };
}

/**
 * Returns source dataset project title column def.
 * @param atlasId - Atlas ID.
 * @returns Column def.
 */
function getSourceDatasetTitleColumnDef(
  atlasId: AtlasId
): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "title",
    cell: ({ row }) => C.Link(buildSourceDatasetTitle(atlasId, row.original)),
    header: "Title",
  };
}
