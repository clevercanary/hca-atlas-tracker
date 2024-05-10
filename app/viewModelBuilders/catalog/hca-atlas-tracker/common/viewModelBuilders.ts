import { STATUS_BADGE_COLOR } from "@databiosphere/findable-ui/lib/components/common/StatusBadge/statusBadge";
import { ColumnDef } from "@tanstack/react-table";
import {
  NETWORKS,
  SYSTEM_DISPLAY_NAMES,
} from "app/apis/catalog/hca-atlas-tracker/common/constants";
import { HCA_ATLAS_TRACKER_CATEGORY_LABEL } from "../../../../../site-config/hca-atlas-tracker/category";
import {
  AtlasId,
  ATLAS_STATUS,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerListAtlas,
  HCAAtlasTrackerListValidationResult,
  HCAAtlasTrackerSourceDataset,
  Network,
  NetworkKey,
  TASK_STATUS,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getSourceDatasetCitation } from "../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { getRouteURL } from "../../../../common/utils";
import * as C from "../../../../components";
import { SOURCE_DATASET_STATUS } from "../../../../components/Index/components/Table/components/SourceDatasetStatusCell/sourceDatasetStatusCell";
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
    url: `/atlases/${encodeURIComponent(atlas.id)}`,
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
 * Build props for the Cell component.
 * @param task - Task entity.
 * @returns Props to be used for the Cell component.
 */
export const buildEntityTitle = (
  task: HCAAtlasTrackerListValidationResult
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: task.entityTitle,
  };
};

/**
 * Build props for the Cell component.
 * @param task - Task entity.
 * @returns Props to be used for the Cell component.
 */
export const buildEntityType = (
  task: HCAAtlasTrackerListValidationResult
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: task.entityType,
  };
};

/**
 * Build props for the "in CAP" SourceDatasetStatusCell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the SourceDatasetStatusCell component.
 */
export const buildInCap = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.SourceDatasetStatusCell> => {
  return {
    value: getSourceDatasetInCap(sourceDataset),
  };
};

/**
 * Build props for the "in CELLxGENE" SourceDatasetStatusCell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the SourceDatasetStatusCell component.
 */
export const buildInCellxGene = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.SourceDatasetStatusCell> => {
  return {
    value: getSourceDatasetInCellxGene(sourceDataset),
  };
};

/**
 * Build props for the "in HCA data repository" SourceDatasetStatusCell component.
 * @param sourceDataset - Source dataset entity.
 * @returns Props to be used for the SourceDatasetStatusCell component.
 */
export const buildInHcaDataRepository = (
  sourceDataset: HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.SourceDatasetStatusCell> => {
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
    url: getRouteURL(ROUTE.SOURCE_DATASET, atlasId, id),
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
 * Build props for the Cell component.
 * @param task - Task entity.
 * @returns Props to be used for the Cell component.
 */
export const buildSystem = (
  task: HCAAtlasTrackerListValidationResult
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: task.system,
  };
};

/**
 * Build props for the BioNetworkCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BioNetworkCell component.
 */
export const buildTaskBioNetworks = (
  task: HCAAtlasTrackerListValidationResult
): React.ComponentProps<typeof C.BioNetworkCell> => {
  return {
    networkKey: task.networks[0],
  };
};

/**
 * Build props for the Cell component.
 * @param task - Task entity.
 * @returns Props to be used for the Cell component.
 */
export const buildTaskDescriptionSystem = (
  task: HCAAtlasTrackerListValidationResult
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: `${task.description.trim().slice(0, -1)} in ${
      SYSTEM_DISPLAY_NAMES[task.system]
    }.`,
  };
};

/**
 * Build props for the Link component.
 * @param task - Task entity.
 * @returns Props to be used for the Link component.
 */
export const buildTaskPublicationString = (
  task: HCAAtlasTrackerListValidationResult
): React.ComponentProps<typeof C.Link> => {
  return {
    label: task.publicationString ?? "",
    url: getDOILink(task.doi),
  };
};

/**
 * Build props for the NTagCell component.
 * @param task - Task entity.
 * @returns Props to be used for the NTagCell component.
 */
export const buildTaskShortNames = (
  task: HCAAtlasTrackerListValidationResult
): React.ComponentProps<typeof C.NTagCell> => {
  return {
    label: "Atlases",
    values: task.atlasShortNames.map((shortName) => `${shortName} v1.0`),
  };
};

/**
 * Build props for the StatusBadge component.
 * @param task - Task entity.
 * @returns Props to be used for the StatusBadge component.
 */
export const buildTaskStatus = (
  task: HCAAtlasTrackerListValidationResult
): React.ComponentProps<typeof C.StatusBadge> => {
  switch (task.taskStatus) {
    case TASK_STATUS.DONE:
      return {
        color: STATUS_BADGE_COLOR.SUCCESS,
        label: "Complete",
      };
    case TASK_STATUS.IN_PROGRESS:
      return {
        color: STATUS_BADGE_COLOR.WARNING,
        label: "In progress",
      };
    case TASK_STATUS.TODO:
      return {
        color: STATUS_BADGE_COLOR.INFO,
        label: "To do",
      };
    default:
      return {
        color: STATUS_BADGE_COLOR.DEFAULT,
        label: "Unspecified",
      };
  }
};

/**
 * Build props for the Cell component.
 * @param task - Task entity.
 * @returns Props to be used for the Cell component.
 */
export const buildTaskTargetCompletionDate = (
  task: HCAAtlasTrackerListValidationResult
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: task.targetCompletionDate,
  };
};

/**
 * Build props for the NTagCell component.
 * @param task - Task entity.
 * @returns Props to be used for the NTagCell component.
 */
export const buildTaskWaves = (
  task: HCAAtlasTrackerListValidationResult
): React.ComponentProps<typeof C.NTagCell> => {
  return {
    label: "Waves",
    values: task.waves,
  };
};

/**
 * Build props for the Cell component.
 * @param task - Task entity.
 * @returns Props to be used for the Cell component.
 */
export const buildValidationType = (
  task: HCAAtlasTrackerListValidationResult
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: task.validationType,
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

/**
 * Returns the DOI link.
 * @param doi - DOI.
 * @returns DOI link.
 */
export function getDOILink(doi: string | null): string {
  if (!doi) return "";
  return `https://doi.org/${encodeURIComponent(doi)}`;
}

/**
 * Returns source dataset is in Cap column def.
 * @returns Column def.
 */
function getSourceDatasetInCapColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorFn: getSourceDatasetInCap,
    cell: ({ row }) => C.SourceDatasetStatusCell(buildInCap(row.original)),
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
    cell: ({ row }) =>
      C.SourceDatasetStatusCell(buildInCellxGene(row.original)),
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
    cell: ({ row }) =>
      C.SourceDatasetStatusCell(buildInHcaDataRepository(row.original)),
    header: "HCA Data Repository",
  };
}

/**
 * Get source dataset status describing whether a source dataset is known to be in CAP.
 * @param sourceDataset - Source dataset.
 * @returns whether the source dataset is in CAP.
 */
function getSourceDatasetInCap(
  sourceDataset: HCAAtlasTrackerSourceDataset
): SOURCE_DATASET_STATUS {
  return sourceDataset.capId
    ? SOURCE_DATASET_STATUS.DONE
    : SOURCE_DATASET_STATUS.REQUIRED;
}

/**
 * Get source dataset status describing whether a source dataset is known to be in CELLxGENE.
 * @param sourceDataset - Source dataset.
 * @returns whether the source dataset is in CELLxGENE.
 */
function getSourceDatasetInCellxGene(
  sourceDataset: HCAAtlasTrackerSourceDataset
): SOURCE_DATASET_STATUS {
  return sourceDataset.cellxgeneCollectionId
    ? SOURCE_DATASET_STATUS.DONE
    : SOURCE_DATASET_STATUS.REQUIRED;
}

/**
 * Get source dataset status describing whether a source dataset is known to be in the HCA data repository.
 * @param sourceDataset - Source dataset.
 * @returns whether the source dataset is in the HCA data repository.
 */
function getSourceDatasetInHcaDataRepository(
  sourceDataset: HCAAtlasTrackerSourceDataset
): SOURCE_DATASET_STATUS {
  return sourceDataset.hcaProjectId
    ? SOURCE_DATASET_STATUS.DONE
    : SOURCE_DATASET_STATUS.REQUIRED;
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
