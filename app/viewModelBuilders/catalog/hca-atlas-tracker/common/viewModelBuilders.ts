import { LABEL } from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { STATUS_BADGE_COLOR } from "@databiosphere/findable-ui/lib/components/common/StatusBadge/statusBadge";
import { ANCHOR_TARGET } from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { LinkProps } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { COLUMN_DEF } from "@databiosphere/findable-ui/lib/components/Table/common/columnDef";
import {
  ColumnConfig,
  ViewContext,
} from "@databiosphere/findable-ui/lib/config/entities";
import { ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { formatFileSize } from "@databiosphere/findable-ui/lib/utils/formatFileSize";
import {
  CellContext,
  ColumnDef,
  Row,
  RowData,
  Table,
} from "@tanstack/react-table";
import { BaseSyntheticEvent, ComponentProps } from "react";
import { HCA_ATLAS_TRACKER_CATEGORY_LABEL } from "../../../../../site-config/hca-atlas-tracker/category";
import {
  NETWORKS,
  STATUS_LABEL,
  UNPUBLISHED,
} from "../../../../apis/catalog/hca-atlas-tracker/common/constants";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerListAtlas,
  HCAAtlasTrackerListValidationRecord,
  HCAAtlasTrackerSourceDataset,
  HCAAtlasTrackerSourceStudy,
  HCAAtlasTrackerUser,
  IngestionTaskCounts,
  Network,
  NetworkKey,
  SYSTEM,
  TASK_STATUS,
  VALIDATION_DESCRIPTION,
  VALIDATION_ID,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  getSourceStudyCitation,
  getSourceStudyTaskStatus,
  isTask,
} from "../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../../common/entities";
import { getRouteURL } from "../../../../common/utils";
import * as C from "../../../../components";
import { CAPIngestStatusCell } from "../../../../components/Table/components/TableCell/components/CAPIngestStatusCell/capIngestStatusCell";
import {
  ICON_STATUS,
  IconStatusBadgeProps,
} from "../../../../components/Table/components/TableCell/components/IconStatusBadge/iconStatusBadge";
import { ROUTE } from "../../../../routes/constants";
import { formatDateToQuarterYear } from "../../../../utils/date-fns";
import { buildSheetsUrl } from "../../../../utils/google-sheets";
import { AtlasIntegratedObject } from "../../../../views/ComponentAtlasesView/entities";
import { UseUnlinkComponentAtlasSourceDatasets } from "../../../../views/ComponentAtlasView/hooks/useUnlinkComponentAtlasSourceDatasets";
import { EXTRA_PROPS } from "./constants";
import {
  COMPONENT_NAME,
  DISEASE,
  ExtraPropsByComponentName,
  METADATA_KEY,
  Unused,
} from "./entities";
import {
  getPluralizedMetadataLabel,
  mapColumnsWithExtraProps,
  partitionMetadataValues,
} from "./utils";

/**
 * Build props for the assay cell component.
 * @param entity - Component atlas or source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildAssay = (
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset
): ComponentProps<typeof C.NTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.ASSAY),
    values: entity.assay,
  };
};

/**
 * Build props for the atlas name cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildAtlasName = (
  atlas: HCAAtlasTrackerListAtlas
): ComponentProps<typeof C.Link> => {
  return {
    label: atlas.name,
    url: `/atlases/${encodeURIComponent(atlas.id)}`,
  };
};

/**
 * Build props for the source datasets cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildAtlasSourceDatasetCount = (
  atlas: HCAAtlasTrackerListAtlas
): ComponentProps<typeof C.Link> => {
  const { id: atlasId } = atlas;
  return {
    label: atlas.sourceDatasetCount,
    url: getRouteURL(ROUTE.ATLAS_SOURCE_DATASETS, { atlasId }),
  };
};

/**
 * Build props for the atlas version cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildAtlasVersion = (
  atlas: HCAAtlasTrackerListAtlas
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: atlas.version,
  };
};

/**
 * Build props for the biological network cell component.
 * @param entity - Entity.
 * @returns Props to be used for the cell.
 */
export const buildBioNetwork = (
  entity: HCAAtlasTrackerListAtlas
): ComponentProps<typeof C.BioNetworkCell> => {
  return {
    networkKey: entity.bioNetwork,
  };
};

/**
 * Build props for the cell count cell component.
 * @param entity - Component atlas or source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildCellCount = (
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: entity.cellCount.toLocaleString(),
  };
};

/**
 * Build props for the component atlases cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildComponentAtlasCount = (
  atlas: HCAAtlasTrackerListAtlas
): ComponentProps<typeof C.Link> => {
  const { id: atlasId } = atlas;
  return {
    label: atlas.componentAtlasCount,
    url: getRouteURL(ROUTE.COMPONENT_ATLASES, { atlasId }),
  };
};

/**
 * Build props for the component atlas file name LinkCell component.
 * @param ctx - Cell context.
 * @param ctx.getValue - Get the value of the cell.
 * @param ctx.row - Get the row of the cell.
 * @returns Props to be used for the LinkCell component.
 */
export const buildComponentAtlasFileName = ({
  getValue,
  row,
}: CellContext<
  AtlasIntegratedObject,
  AtlasIntegratedObject["fileName"]
>): ComponentProps<typeof C.LinkCell> => {
  const fileName = getValue();
  const atlasId = row.getValue("atlasId") as string;
  const componentAtlasId = row.getValue("id") as string;
  return {
    getValue: () => ({
      children: fileName,
      href: getRouteURL(ROUTE.COMPONENT_ATLAS, { atlasId, componentAtlasId }),
    }),
  };
};

/**
 * Build props for the "created at" BasicCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildCreatedAt = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: getDateFromIsoString(task.createdAt),
  };
};

/**
 * Build props for the disease cell component.
 * @param entity - Component atlas or source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildDisease = (
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset
): ComponentProps<typeof C.PinnedNTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.DISEASE),
    values: partitionMetadataValues(entity.disease, [DISEASE.NORMAL]),
  };
};

/**
 * Build props for the EditTasks component.
 * @param rows - Table rows.
 * @returns Props to be used for the EditTasks component.
 */
export const buildEditTask = (
  rows: Row<HCAAtlasTrackerListValidationRecord>[]
): ComponentProps<typeof C.EditTasks> => {
  return {
    rows,
  };
};

/**
 * Build props for the BasicCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildEntityTitle = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.BasicCell> => {
  const { entityTitle } = task;
  return {
    value: entityTitle,
  };
};

/**
 * Build props for the BasicCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildEntityType = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: task.entityType,
  };
};

/**
 * Build props for the gene count cell component.
 * @param entity - Component atlas or source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildGeneCount = (
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: entity.geneCount?.toLocaleString() ?? "",
  };
};

/**
 * Build props for the CAP ingestion counts TaskCountsCell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the TaskCountsCell.
 */
export const buildIngestionCountsCap = (
  atlas: HCAAtlasTrackerListAtlas
): ComponentProps<typeof C.TaskCountsCell> => {
  return buildIngestionCountsForSystem(atlas, SYSTEM.CAP);
};

/**
 * Build props for the ingestion counts TaskCountsCell component for the given system.
 * @param atlas - Atlas entity.
 * @param system - System.
 * @returns Props to be used for the TaskCountsCell.
 */
export const buildIngestionCountsForSystem = (
  atlas: HCAAtlasTrackerListAtlas,
  system: keyof IngestionTaskCounts
): ComponentProps<typeof C.TaskCountsCell> => {
  const { completedCount, count } = atlas.ingestionTaskCounts[system];
  return {
    label: `${completedCount}/${count}`,
    url: getTaskCountUrlObject(
      atlas,
      system,
      VALIDATION_DESCRIPTION.INGEST_SOURCE_STUDY
    ),
    value: getProgressValue(completedCount, count),
  };
};

/**
 * Build props for the HCA ingestion counts TaskCountsCell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the TaskCountsCell.
 */
export const buildIngestionCountsHca = (
  atlas: HCAAtlasTrackerListAtlas
): ComponentProps<typeof C.TaskCountsCell> => {
  return buildIngestionCountsForSystem(atlas, SYSTEM.HCA_DATA_REPOSITORY);
};

/**
 * Build props for the integration lead cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildIntegrationLead = (
  atlas: HCAAtlasTrackerListAtlas
): ComponentProps<typeof C.NTagCell> => {
  return {
    label: "integration leads",
    values: atlas.integrationLeadName,
  };
};

/**
 * Build props for the "Metadata Entry Sheet" column
 * @param sourceStudy  - Source study entity.
 * @returns Props to be used for the cell
 */
export function buildMetadataSpreadsheets(
  sourceStudy: HCAAtlasTrackerSourceStudy
): ComponentProps<typeof C.LinksCell> {
  return {
    links: sourceStudy.metadataSpreadsheets.map(({ id, title }) => {
      const url = buildSheetsUrl(id);
      return {
        label: title ?? url,
        noWrap: true,
        target: ANCHOR_TARGET.BLANK,
        url,
      };
    }),
  };
}

/**
 * Build props for the "Metadata Spreadsheet" Link component
 * @param atlas  - Atlas entity.
 * @returns Props to be used for the cell
 */
export function buildMetadataSpecification(
  atlas: HCAAtlasTrackerListAtlas
): ComponentProps<typeof C.Link> {
  return {
    label: atlas?.metadataSpecificationUrl,
    noWrap: true,
    target: ANCHOR_TARGET.BLANK,
    url: atlas?.metadataSpecificationUrl ?? "",
  };
}

/**
 * Build props for the "resolved at" BasicCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildResolvedAt = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: task.resolvedAt
      ? getDateFromIsoString(task.resolvedAt)
      : LABEL.EMPTY,
  };
};

/**
 * Build props for the source dataset count cell component.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildSourceDatasetCount = (
  componentAtlas: AtlasIntegratedObject
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: componentAtlas.sourceDatasetCount.toLocaleString(),
  };
};

/**
 * Build props for the CAP IconStatusBadge component.
 * @param sourceStudy - Source study entity.
 * @returns Props to be used for the IconStatusBadge component.
 */
export const buildSourceStudyCapStatus = (
  sourceStudy: HCAAtlasTrackerSourceStudy
): ComponentProps<typeof C.IconStatusBadge> => {
  return getSourceStudyStatusFromValidation(
    sourceStudy,
    VALIDATION_ID.SOURCE_STUDY_IN_CAP
  );
};

/**
 * Build props for the HCA Data Repository IconStatusBadge component.
 * @param sourceStudy - Source study entity.
 * @returns Props to be used for the IconStatusBadge component.
 */
export const buildSourceStudyHcaDataRepositoryStatus = (
  sourceStudy: HCAAtlasTrackerSourceStudy
): ComponentProps<typeof C.IconStatusBadge> => {
  const ingestStatus = getSourceStudyTaskStatus(
    sourceStudy,
    VALIDATION_ID.SOURCE_STUDY_IN_HCA_DATA_REPOSITORY
  );
  if (ingestStatus === TASK_STATUS.DONE) {
    const primaryDataStatus = getSourceStudyTaskStatus(
      sourceStudy,
      VALIDATION_ID.SOURCE_STUDY_HCA_PROJECT_HAS_PRIMARY_DATA
    );
    if (primaryDataStatus === TASK_STATUS.DONE)
      return {
        label: STATUS_LABEL.FASTQS,
        status: ICON_STATUS.DONE,
      };
    else if (primaryDataStatus === TASK_STATUS.BLOCKED)
      return {
        label: STATUS_LABEL.FASTQS_BLOCKED,
        status: ICON_STATUS.BLOCKED,
      };
    else
      return {
        label: STATUS_LABEL.NEEDS_FASTQS,
        status: ICON_STATUS.PARTIALLY_COMPLETE,
      };
  } else {
    return {
      label: STATUS_LABEL.TODO,
      status: ICON_STATUS.REQUIRED,
    };
  }
};

/**
 * Build props for the source study publication Link component.
 * @param sourceStudy - Source study entity.
 * @returns Props to be used for the Link component.
 */
export const buildSourceStudyPublication = (
  sourceStudy: HCAAtlasTrackerSourceStudy
): ComponentProps<typeof C.Link> => {
  const { doi } = sourceStudy;
  return {
    label: doi === null ? "" : C.OpenInNewIcon({}),
    url: getDOILink(doi),
  };
};

/**
 * Build props for the source study title Link component.
 * @param pathParameter - Path parameter.
 * @param sourceStudy - Source study entity.
 * @returns Props to be used for the Link component.
 */
export const buildSourceStudyTitle = (
  pathParameter: PathParameter,
  sourceStudy: HCAAtlasTrackerSourceStudy
): ComponentProps<typeof C.Link> => {
  const { id: sourceStudyId } = sourceStudy;
  return {
    label: getSourceStudyCitation(sourceStudy),
    url: getRouteURL(ROUTE.SOURCE_STUDY, {
      ...pathParameter,
      sourceStudyId,
    }),
  };
};

/**
 * Build props for the source studies cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildSourceStudyCount = (
  atlas: HCAAtlasTrackerListAtlas
): ComponentProps<typeof C.Link> => {
  const { id: atlasId } = atlas;
  return {
    label: atlas.sourceStudyCount,
    url: getRouteURL(ROUTE.SOURCE_STUDIES, { atlasId }),
  };
};

/**
 * Build props for the status cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildStatus = (
  atlas: HCAAtlasTrackerListAtlas
): ComponentProps<typeof C.StatusBadge> => {
  return getAtlasStatusBadgeProps(atlas.status);
};

/**
 * Build props for the suspension type cell component.
 * @param entity - Component atlas or source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildSuspensionType = (
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset
): ComponentProps<typeof C.NTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.SUSPENSION_TYPE),
    values: entity.suspensionType,
  };
};

/**
 * Build props for the BasicCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildSystem = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: task.system,
  };
};

/**
 * Build props for the BasicCell component.
 * @param entity - Task or atlas entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildTargetCompletion = (
  entity: HCAAtlasTrackerListValidationRecord | HCAAtlasTrackerListAtlas
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: formatDateToQuarterYear(entity.targetCompletion),
  };
};

/**
 * Build props for the task atlas names cell component.
 * @param task - Task entity.
 * @returns Props to be used for the cell.
 */
export const buildTaskAtlasNames = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.NTagCell> => {
  return {
    label: "atlases",
    values: task.atlasNames,
  };
};

/**
 * Build props for the atlas version cell component.
 * @param task - Task entity.
 * @returns Props to be used for the cell.
 */
export const buildTaskAtlasVersions = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.NTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.ATLAS_VERSION),
    values: task.atlasVersions,
  };
};

/**
 * Build props for the ButtonTextPrimaryCell component.
 * @param task - Task entity.
 * @param viewContext - View context.
 * @returns Props to be used for the ButtonTextPrimaryCell component.
 */
export const buildTaskDescription = (
  task: HCAAtlasTrackerListValidationRecord,
  viewContext: ViewContext<HCAAtlasTrackerListValidationRecord>
): ComponentProps<typeof C.ButtonTextPrimaryCell> => {
  const { description } = task;
  const { cellContext } = viewContext;
  return {
    children: description,
    onClick: (e: BaseSyntheticEvent): void => {
      e.preventDefault();
      cellContext?.row.togglePreview();
    },
  };
};

/**
 * Build props for the BioNetworkCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BioNetworkCell component.
 */
export const buildTaskNetworks = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.BioNetworkCell> => {
  return {
    networkKey: task.networks[0],
  };
};

/**
 * Build props for the RowDrawer component.
 * @param _ - Unused.
 * @param viewContext - View context.
 * @returns Props to be used for the RowDrawer component.
 */
export const buildTaskRowPreview = (
  _: Unused,
  viewContext: ViewContext<HCAAtlasTrackerListValidationRecord>
): ComponentProps<typeof C.RowDrawer<HCAAtlasTrackerListValidationRecord>> => {
  const { tableInstance } = viewContext;
  return {
    tableInstance,
    title: getTaskRowPreviewTitle(tableInstance),
  };
};

/**
 * Build props for the PreviewTask component.
 * @param task - Task entity.
 * @param columns - Column config.
 * @returns Props to be used for the PreviewTask component.
 */
export const buildTaskPreviewDetails = (
  task: HCAAtlasTrackerListValidationRecord,
  columns: ColumnConfig<HCAAtlasTrackerListValidationRecord>[]
): ComponentProps<typeof C.PreviewTask> => {
  return {
    columns: mapColumnsWithExtraProps(
      columns,
      getTaskRowPreviewExtraPropsByComponentName()
    ),
    task,
  };
};

/**
 * Build props for the Link component.
 * @param task - Task entity.
 * @returns Props to be used for the Link component.
 */
export const buildTaskPublicationString = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.Link> => {
  const { atlasIds, entityId: sourceStudyId } = task;
  const atlasId = atlasIds[0];
  return {
    label: task.publicationString ?? "",
    url: getRouteURL(ROUTE.SOURCE_STUDY, { atlasId, sourceStudyId }),
  };
};

/**
 * Build props for the DOI cell component.
 * @param task - Task entity.
 * @returns Props to be used for the cell.
 */
export const buildTaskDoi = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.Link> => {
  const { doi } = task;
  return {
    label: doi,
    url: getDOILink(doi),
  };
};

/**
 * Build props for the Link component.
 * @param task - Task entity.
 * @returns Props to be used for the Link component.
 */
export const buildTaskRelatedEntityUrl = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.Link> => {
  const url = task.relatedEntityUrl ?? LABEL.EMPTY;
  return {
    label: url || "N/A",
    url,
  };
};

/**
 * Build props for the StatusBadge component.
 * @param task - Task entity.
 * @returns Props to be used for the StatusBadge component.
 */
export const buildTaskStatus = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.StatusBadge> => {
  switch (task.taskStatus) {
    case TASK_STATUS.BLOCKED:
      return {
        color: STATUS_BADGE_COLOR.WARNING,
        label: "Blocked",
      };
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
 * Build props for the NTagCell component.
 * @param task - Task entity.
 * @returns Props to be used for the NTagCell component.
 */
export const buildTaskWaves = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.NTagCell> => {
  return {
    label: "Waves",
    values: task.waves,
  };
};

/**
 * Build props for the tissue cell component.
 * @param entity - Component atlas or source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildTissue = (
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset
): ComponentProps<typeof C.NTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.TISSUE),
    values: entity.tissue,
  };
};

/**
 * Build props for the "updated at" BasicCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildUpdatedAt = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: getDateFromIsoString(task.updatedAt),
  };
};

/**
 * Build props for the disabled status cell component.
 * @param user - User entity.
 * @returns Props to be used for the cell.
 */
export const buildUserDisabled = (
  user: HCAAtlasTrackerUser
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: user.disabled.toString(),
  };
};

/**
 * Build props for the email cell component.
 * @param user - User entity.
 * @returns Props to be used for the cell.
 */
export const buildUserEmail = (
  user: HCAAtlasTrackerUser
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: user.email,
  };
};

/**
 * Build props for the name cell component.
 * @param user - User entity.
 * @returns Props to be used for the cell.
 */
export const buildUserFullName = (
  user: HCAAtlasTrackerUser
): ComponentProps<typeof C.Link> => {
  return {
    label: user.fullName,
    url: getRouteURL(ROUTE.USER, { userId: user.id }),
  };
};

/**
 * Build props for the last login cell component.
 * @param user - User entity.
 * @returns Props to be used for the cell.
 */
export const buildUserLastLogin = (
  user: HCAAtlasTrackerUser
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: user.lastLogin,
  };
};

/**
 * Build props for the role cell component.
 * @param user - User entity.
 * @returns Props to be used for the cell.
 */
export const buildUserRole = (
  user: HCAAtlasTrackerUser
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: user.role,
  };
};

/**
 * Build props for the role-associated resource names cell component.
 * @param user - User entity.
 * @returns Props to be used for the cell.
 */
export const buildUserAssociatedResources = (
  user: HCAAtlasTrackerUser
): ComponentProps<typeof C.NTagCell> => {
  return {
    label: getPluralizedMetadataLabel(
      METADATA_KEY.ROLE_ASSOCIATED_RESOURCE_NAMES
    ),
    values: user.roleAssociatedResourceNames,
  };
};

/**
 * Build props for the BasicCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildValidationType = (
  task: HCAAtlasTrackerListValidationRecord
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: task.validationType,
  };
};

/**
 * Build props for the wave BasicCell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildWave = (
  atlas: HCAAtlasTrackerListAtlas
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: atlas.wave,
  };
};

/**
 * Get props for the status badge component for the given atlas status.
 * @param status - Atlas status.
 * @returns status badge props.
 */
export function getAtlasStatusBadgeProps(
  status: ATLAS_STATUS
): ComponentProps<typeof C.StatusBadge> {
  switch (status) {
    case ATLAS_STATUS.OC_ENDORSED:
      return {
        color: STATUS_BADGE_COLOR.SUCCESS,
        label: "OC endorsed",
      };
    case ATLAS_STATUS.IN_PROGRESS:
      return {
        color: STATUS_BADGE_COLOR.WARNING,
        label: "In progress",
      };
    default:
      return {
        color: STATUS_BADGE_COLOR.DEFAULT,
        label: "Unspecified",
      };
  }
}

/*
 * Returns source dataset or component atlas assay column def.
 * @returns Column def.
 */
function getAssayColumnDef<
  T extends HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset
>(): ColumnDef<T> {
  return {
    accessorKey: "assay",
    cell: ({ row }) => C.NTagCell(buildAssay(row.original)),
    header: "Assay",
  };
}

/**
 * Returns the table column definition model for the atlas (edit mode) component atlases table.
 * @returns Table column definition.
 */
export function getAtlasComponentAtlasesTableColumns(): ColumnDef<
  AtlasIntegratedObject,
  unknown
>[] {
  const META = { width: { max: "1fr", min: "136px" } };
  return [
    COLUMN_DEF.ROW_POSITION,
    COLUMN_DEF.ROW_SELECTION,
    getIntegratedObjectFileDownloadColumnDef(),
    getIntegratedObjectFileNameColumnDef(),
    getComponentAtlasTitleColumnDef(),
    getIntegratedObjectFileSizeColumnDef(),
    {
      accessorKey: "fileEventTime",
      cell: ({ row }) => row.original.fileEventTime,
      header: "Uploaded At",
      meta: { width: { max: "1fr", min: "160px" } },
    },
    getIntegratedObjectValidationStatusColumnDef(),
    {
      accessorKey: "capIngestStatus",
      cell: CAPIngestStatusCell,
      enableSorting: false,
      header: "CAP Ingest Status",
      meta: { width: { max: "1fr", min: "160px" } },
    },
    {
      accessorKey: "capUrl",
      cell: ({ row }) => C.CAPCell({ capUrl: row.original.capUrl }),
      enableSorting: false,
      header: "CAP",
      meta: { width: { max: "1fr", min: "160px" } },
    },
    getComponentAtlasSourceDatasetCountColumnDef(),
    {
      ...getAssayColumnDef(),
      meta: META,
    },
    {
      ...getSuspensionTypeColumnDef(),
      meta: META,
    },
    {
      ...getTissueColumnDef(),
      meta: META,
    },
    {
      ...getDiseaseColumnDef(),
      meta: META,
    },
    {
      ...getCellCountColumnDef(),
      meta: META,
    },
    {
      ...getGeneCountColumnDef(),
      meta: META,
    },
    /* Hidden columns */
    { accessorKey: "atlasId" },
    { accessorKey: "fileId" },
    { accessorKey: "id" },
  ] as ColumnDef<AtlasIntegratedObject, unknown>[];
}

/**
 * Returns the table column definition model for the atlas component source datasets table.
 * @param onUnlink - Unlink source datasets function.
 * @param canEdit - Edit state for user.
 * @param atlasId - ID of the associated atlas.
 * @returns Table column definition.
 */
export function getAtlasComponentSourceDatasetsTableColumns(
  onUnlink: UseUnlinkComponentAtlasSourceDatasets["onUnlink"],
  canEdit: boolean,
  atlasId: string
): ColumnDef<HCAAtlasTrackerSourceDataset>[] {
  const columnDefs: ColumnDef<HCAAtlasTrackerSourceDataset>[] = [
    getComponentAtlasSourceDatasetPublicationColumnDef(),
    getComponentAtlasSourceDatasetFileNameColumnDef(atlasId),
    getComponentAtlasSourceDatasetTitleColumnDef(),
    getSourceDatasetExploreColumnDef(),
    getAssayColumnDef(),
    getSuspensionTypeColumnDef(),
    getTissueColumnDef(),
    getDiseaseColumnDef(),
    getComponentAtlasSourceDatasetSourceStudyCellCountColumnDef(),
  ];
  if (canEdit) {
    columnDefs.push(getComponentAtlasSourceDatasetUnlinkColumnDef(onUnlink));
  }
  return columnDefs;
}

/**
 * Returns the table column definition model for the atlas source datasets table.
 * @returns Table column definition.
 */
export function getAtlasSourceStudySourceDatasetsTableColumns(): ColumnDef<HCAAtlasTrackerSourceDataset>[] {
  return [
    getSourceDatasetDownloadColumnDef(),
    getSourceDatasetTitleColumnDef(),
    getAssayColumnDef(),
    getSuspensionTypeColumnDef(),
    getTissueColumnDef(),
    getDiseaseColumnDef(),
    getCellCountColumnDef(),
  ];
}

/**
 * Returns the publication string column definition model for the component atlas source datasets selection table.
 * @returns Column definition.
 */
function getComponentAtlasSourceDatasetsSelectionPublicationStringColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "publicationString",
    cell: ({
      row,
      table,
    }: CellContext<HCAAtlasTrackerSourceDataset, unknown>) =>
      C.GroupedRowSelectionCell({
        label: row.original.publicationString,
        row,
        table,
      }),
    meta: { columnPinned: true },
  };
}

/**
 * Returns the file name column definition model for the component atlas source datasets selection table.
 * @returns Column def.
 */
function getComponentAtlasSourceDatasetsSelectionFileNameColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "fileName",
    cell: ({ row }) =>
      C.RowSelectionCell({
        label: row.original.fileName,
        row,
      }),
    header: "File Name",
    meta: { columnPinned: true },
  };
}

/**
 * Returns the title column definition model for the component atlas source datasets selection table.
 * @returns Column definition.
 */
function getComponentAtlasSourceDatasetsSelectionTitleColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "title",
    cell: ({ row }: CellContext<HCAAtlasTrackerSourceDataset, unknown>) =>
      C.BasicCell({
        value: row.original.title,
      }),
    header: "Title",
  };
}

/**
 * Returns the table column definition model for the component atlas source datasets selection table.
 * @returns Table column definition.
 */
export function getComponentAtlasSourceDatasetsSelectionTableColumns(): ColumnDef<HCAAtlasTrackerSourceDataset>[] {
  return [
    getComponentAtlasSourceDatasetsSelectionPublicationStringColumnDef(),
    getComponentAtlasSourceDatasetsSelectionFileNameColumnDef(),
    getComponentAtlasSourceDatasetsSelectionTitleColumnDef(),
    getAssayColumnDef(),
    getSuspensionTypeColumnDef(),
    getTissueColumnDef(),
    getDiseaseColumnDef(),
    getCellCountColumnDef(),
  ];
}

/**
 * Returns the table column definition model for the atlas (edit mode) source studies table.
 * @param pathParameter - Path parameter.
 * @param atlasLinkedDatasetsByStudyId - Arrays of atlas-linked datasets indexed by source study.
 * @returns Table column definition.
 */
export function getAtlasSourceStudiesTableColumns(
  pathParameter: PathParameter,
  atlasLinkedDatasetsByStudyId: Map<string, HCAAtlasTrackerSourceDataset[]>
): ColumnDef<HCAAtlasTrackerSourceStudy>[] {
  return [
    getSourceStudyTitleColumnDef(pathParameter),
    getSourceStudyPublicationColumnDef(),
    getSourceStudyMetadataSpreadsheetColumnDef(),
    getSourceStudySourceDatasetCountColumnDef(
      pathParameter,
      atlasLinkedDatasetsByStudyId
    ),
    getSourceStudyCapStatusColumnDef(),
    getSourceStudyHCADataRepositoryStatusColumnDef(),
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
 * Returns source dataset or component atlas cell count column def.
 * @returns Column def.
 */
function getCellCountColumnDef<
  T extends HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset
>(): ColumnDef<T> {
  return {
    accessorKey: "cellCount",
    cell: ({ row }) => C.BasicCell(buildCellCount(row.original)),
    header: "Cell Count",
    meta: { width: { max: "0.75fr", min: "120px" } },
  };
}

/**
 * Returns component atlas source dataset file name column def.
 * @param atlasId - ID of the associated atlas.
 * @returns ColumnDef.
 */
function getComponentAtlasSourceDatasetFileNameColumnDef(
  atlasId: string
): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "fileName",
    cell: ({ row }) =>
      C.Link({
        label: row.original.fileName,
        url: getRouteURL(ROUTE.ATLAS_SOURCE_DATASET, {
          atlasId: atlasId,
          sourceDatasetId: row.original.id,
        }),
      }),
    header: "File Name",
    meta: { columnPinned: true },
  };
}

/**
 * Returns source dataset publication column def.
 * @returns Column def.
 */
function getComponentAtlasSourceDatasetPublicationColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "publicationString",
    cell: ({ row }) =>
      C.Link({
        label: row.original.publicationString,
        url: getDOILink(row.original.doi),
      }),
    header: "Publication",
  };
}

/**
 * Returns component atlas source dataset cell count column def.
 * @returns ColumnDef.
 */
function getComponentAtlasSourceDatasetSourceStudyCellCountColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "cellCount",
    cell: ({ row }) => C.BasicCell(buildCellCount(row.original)),
    header: "Cell count",
  };
}

/**
 * Returns component atlas source dataset title column def.
 * @returns ColumnDef.
 */
function getComponentAtlasSourceDatasetTitleColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "title",
    cell: ({ row }) => C.BasicCell({ value: row.original.title }),
    header: "Source Dataset",
    meta: { columnPinned: true },
  };
}

/**
 * Returns component atlas source dataset unlink column def.
 * @param onUnlink - Unlink source datasets function.
 * @returns ColumnDef.
 */
function getComponentAtlasSourceDatasetUnlinkColumnDef(
  onUnlink: UseUnlinkComponentAtlasSourceDatasets["onUnlink"]
): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "delete",
    cell: ({ row }) =>
      C.IconButton({
        Icon: C.UnLinkIcon,
        color: ICON_BUTTON_PROPS.COLOR.SECONDARY,
        onClick: () =>
          onUnlink({
            sourceDatasetIds: [row.original.id],
          }),
        size: ICON_BUTTON_PROPS.SIZE.MEDIUM,
      }),
    enableSorting: false,
    header: "",
  };
}

/**
 * Returns component atlas source dataset count column def.
 * @returns ColumnDef.
 */
function getComponentAtlasSourceDatasetCountColumnDef(): ColumnDef<AtlasIntegratedObject> {
  return {
    accessorKey: "sourceDatasetCount",
    cell: ({ row }) => C.BasicCell(buildSourceDatasetCount(row.original)),
    header: "Source Datasets",
    meta: { width: { max: "1fr", min: "136px" } },
  };
}

/**
 * Returns component atlas title column def.
 * @returns ColumnDef.
 */
function getComponentAtlasTitleColumnDef(): ColumnDef<AtlasIntegratedObject> {
  return {
    accessorKey: "title",
    header: "Title",
    meta: { width: { max: "1fr", min: "136px" } },
  };
}

/**
 * Returns component atlas or source dataset disease column def.
 * @returns ColumnDef.
 */
function getDiseaseColumnDef<
  T extends HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset
>(): ColumnDef<T> {
  return {
    accessorKey: "disease",
    cell: ({ row }) => C.PinnedNTagCell(buildDisease(row.original)),
    header: "Disease",
  };
}

/**
 * Returns the DOI link.
 * @param doi - DOI or DOI URL.
 * @returns DOI link.
 */
export function getDOILink(doi: string | null): string {
  if (!doi || doi === UNPUBLISHED) return "";
  if (doi.startsWith("https://doi.org/")) return doi;
  return `https://doi.org/${encodeURIComponent(doi)}`;
}

/**
 * Get date-only string from ISO datetime with 4-digit year, defaulting to the full string if it's improperly formatted.
 * @param isoString - ISO datetime.
 * @returns date in YYYY-MM-DD format.
 */
function getDateFromIsoString(isoString: string): string {
  return /\d{4}-\d{2}-\d{2}/.exec(isoString)?.[0] ?? isoString;
}

/**
 * Returns the entity model from the table row.
 * @param row - Row.
 * @param isEntity - Entity type guard.
 * @returns entity.
 */
function getEntityFromRowData<T extends RowData>(
  row?: Row<T>,
  isEntity?: (rowData: RowData) => rowData is T
): T | undefined {
  if (!row) return;
  if (isEntity?.(row.original)) {
    return row.original;
  }
}

/**
 * Returns source dataset or component atlas gene count column def.
 * @returns Column def.
 */
function getGeneCountColumnDef<
  T extends HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset
>(): ColumnDef<T> {
  return {
    accessorKey: "geneCount",
    cell: ({ row }) => C.BasicCell(buildGeneCount(row.original)),
    header: "Gene Count",
    meta: { width: { max: "0.75fr", min: "120px" } },
  };
}

/**
 * Returns the integrated object file download column def.
 * @returns ColumnDef.
 */
function getIntegratedObjectFileDownloadColumnDef<
  T extends AtlasIntegratedObject
>(): ColumnDef<T> {
  return {
    accessorKey: "download",
    cell: ({ row, table }): JSX.Element => {
      const {
        options: { meta },
      } = table;
      const { canEdit = false } = meta as { canEdit: boolean };
      const { fileId, fileName, sizeBytes } = row.original;
      return C.FileDownloadCell({
        disabled: !canEdit,
        fileId,
        fileName,
        sizeBytes,
      });
    },
    enableSorting: false,
    header: "Download",
    meta: { width: "max-content" },
  };
}

/**
 * Returns the integrated object file name column def.
 * @returns ColumnDef.
 */
function getIntegratedObjectFileNameColumnDef(): ColumnDef<
  AtlasIntegratedObject,
  AtlasIntegratedObject["fileName"]
> {
  return {
    accessorKey: "fileName",
    cell: (ctx) => C.LinkCell(buildComponentAtlasFileName(ctx)),
    header: "File Name",
    meta: { columnPinned: true, width: { max: "1fr", min: "136px" } },
  };
}

/**
 * Returns the integrated object file size column def.
 * @returns ColumnDef.
 */
function getIntegratedObjectFileSizeColumnDef(): ColumnDef<
  AtlasIntegratedObject,
  AtlasIntegratedObject["sizeBytes"]
> {
  return {
    accessorKey: "sizeBytes",
    cell: (ctx) => formatFileSize(ctx.getValue()),
    header: "File Size",
    meta: { width: { max: "1fr", min: "136px" } },
  };
}

/**
 * Returns the integrated object validation status column def.
 * @returns ColumnDef.
 */
function getIntegratedObjectValidationStatusColumnDef(): ColumnDef<
  AtlasIntegratedObject,
  AtlasIntegratedObject["validationStatus"]
> {
  return {
    accessorKey: "validationStatus",
    cell: (ctx): JSX.Element | null => {
      return C.ValidationStatusCell({
        ...ctx,
        componentAtlasId: ctx.row.original.id,
        validationRoute: ROUTE.INTEGRATED_OBJECT_VALIDATION,
      });
    },
    header: "Validation Summary",
    meta: { width: { max: "1fr", min: "136px" } },
  };
}

/**
 * Returns the progress value as a percentage.
 * @param numerator - Numerator.
 * @param denominator - Denominator.
 * @returns Progress value as a percentage.
 */
function getProgressValue(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return (numerator / denominator) * 100;
}

/**
 * Returns source dataset download column def.
 * CHECK
 * @returns Column def.
 */
function getSourceDatasetDownloadColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "download",
    cell: (ctx): JSX.Element =>
      C.FileDownloadCell({
        fileId: ctx.row.original.fileId,
        fileName: ctx.row.original.fileName,
        sizeBytes: ctx.row.original.sizeBytes,
      }),
    enableSorting: false,
    header: "Download",
  };
}

/**
 * Returns source dataset explore column def.
 * @returns Column def.
 */
function getSourceDatasetExploreColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "explore",
    cell: ({ row }): JSX.Element => {
      const { cellxgeneExplorerUrl } = row.original;
      const analysisPortals = cellxgeneExplorerUrl
        ? [
            {
              icon: "/icons/cxg.png",
              label: "CZ CELLxGENE",
              name: "cellxgene",
              url: cellxgeneExplorerUrl,
            },
          ]
        : [];
      return C.AnalysisPortalCell({
        analysisPortals,
      });
    },
    enableSorting: false,
    header: "Explore",
  };
}

/**
 * Returns source dataset title column def.
 * @returns Column def.
 */
function getSourceDatasetTitleColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "title",
    cell: ({ row }) =>
      C.BasicCell({
        value: row.original.title,
      }),
    header: "Title",
    meta: { columnPinned: true },
  };
}

/**
 * Returns source study is in Cap column def.
 * @returns Column def.
 */
function getSourceStudyCapStatusColumnDef(): ColumnDef<HCAAtlasTrackerSourceStudy> {
  return {
    cell: ({ row }) =>
      C.IconStatusBadge(buildSourceStudyCapStatus(row.original)),
    header: "CAP",
  };
}

/**
 * Returns source study in HCA data repository column def.
 * @returns Column def.
 */
function getSourceStudyHCADataRepositoryStatusColumnDef(): ColumnDef<HCAAtlasTrackerSourceStudy> {
  return {
    cell: ({ row }) =>
      C.IconStatusBadge(buildSourceStudyHcaDataRepositoryStatus(row.original)),
    header: "HCA Data Repository",
  };
}

/**
 * Returns source study metadata spreadsheet column def.
 * @returns Column def.
 */
function getSourceStudyMetadataSpreadsheetColumnDef(): ColumnDef<HCAAtlasTrackerSourceStudy> {
  return {
    accessorKey: "metdataSpreadsheets",
    cell: ({ row }) => C.LinksCell(buildMetadataSpreadsheets(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.METADATA_SPREADSHEETS,
  };
}

/**
 * Get source study status reflecting the status of a given task for the specified source study.
 * @param sourceStudy - Source study.
 * @param validationId - Validation ID to get task status for.
 * @returns source study status.
 */
function getSourceStudyStatusFromValidation(
  sourceStudy: HCAAtlasTrackerSourceStudy,
  validationId: VALIDATION_ID
): IconStatusBadgeProps {
  const taskStatus = getSourceStudyTaskStatus(sourceStudy, validationId);
  return taskStatus === TASK_STATUS.DONE
    ? {
        label: STATUS_LABEL.COMPLETE,
        status: ICON_STATUS.DONE,
      }
    : taskStatus === TASK_STATUS.IN_PROGRESS
    ? {
        label: STATUS_LABEL.IN_PROGRESS,
        status: ICON_STATUS.IN_PROGRESS,
      }
    : {
        label: STATUS_LABEL.TODO,
        status: ICON_STATUS.REQUIRED,
      };
}

/**
 * Returns source study publication column def.
 * @returns Column def.
 */
function getSourceStudyPublicationColumnDef(): ColumnDef<HCAAtlasTrackerSourceStudy> {
  return {
    accessorKey: "publication",
    cell: ({ row }) => C.Link(buildSourceStudyPublication(row.original)),
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION,
  };
}

/**
 * Returns source study source datasets count column def.
 * @param pathParameter - Path parameter.
 * @param atlasLinkedDatasetsByStudyId - Arrays of atlas-linked datasets indexed by source study.
 * @returns Column def.
 */
function getSourceStudySourceDatasetCountColumnDef(
  pathParameter: PathParameter,
  atlasLinkedDatasetsByStudyId: Map<string, HCAAtlasTrackerSourceDataset[]>
): ColumnDef<HCAAtlasTrackerSourceStudy> {
  return {
    cell: ({ row }) =>
      C.LinkCell({
        getValue: () => ({
          children:
            atlasLinkedDatasetsByStudyId.get(row.original.id)?.length ?? 0,
          href: getRouteURL(ROUTE.SOURCE_DATASETS, {
            ...pathParameter,
            sourceStudyId: row.original.id,
          }),
        }),
      }),
    header: "Datasets",
  };
}

/**
 * Returns source study project title column def.
 * @param pathParameter - Path parameter.
 * @returns Column def.
 */
function getSourceStudyTitleColumnDef(
  pathParameter: PathParameter
): ColumnDef<HCAAtlasTrackerSourceStudy> {
  return {
    accessorKey: "title",
    cell: ({ row }) =>
      C.Link(buildSourceStudyTitle(pathParameter, row.original)),
    header: "Source Study",
    meta: { columnPinned: true },
  };
}

/**
 * Returns component atlas or source dataset suspension type column def.
 * @returns ColumnDef.
 */
function getSuspensionTypeColumnDef<
  T extends HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset
>(): ColumnDef<T> {
  return {
    accessorKey: "suspensionType",
    cell: ({ row }) => C.NTagCell(buildSuspensionType(row.original)),
    header: "Suspension Type",
  };
}

/**
 * Returns the URL object for the task count link.
 * @param atlas - Atlas entity.
 * @param system - System to limit tasks to.
 * @param task - Description to limit tasks to.
 * @returns URL object for the task count link.
 */
function getTaskCountUrlObject(
  atlas: HCAAtlasTrackerListAtlas,
  system?: SYSTEM,
  task?: VALIDATION_DESCRIPTION
): LinkProps["url"] {
  const params = {
    filter: [
      {
        categoryKey: "atlasNames",
        value: [atlas.name],
      },
      ...(system
        ? [
            {
              categoryKey: "system",
              value: [system],
            },
          ]
        : []),
      ...(task
        ? [
            {
              categoryKey: "description",
              value: [task],
            },
          ]
        : []),
    ],
  };
  return {
    href: ROUTE.REPORTS,
    query: encodeURIComponent(JSON.stringify(params)),
  };
}

/**
 * Returns extra props by component name for the task row preview.
 * @returns extra props by component name.
 */
function getTaskRowPreviewExtraPropsByComponentName(): ExtraPropsByComponentName {
  const extraPropsByComponentName: ExtraPropsByComponentName = new Map();
  extraPropsByComponentName.set(
    COMPONENT_NAME.BIO_NETWORK_CELL,
    EXTRA_PROPS.BIO_NETWORK_CELL
  );
  return extraPropsByComponentName;
}

/**
 * Returns the title for the task row preview.
 * @param tableInstance - Table.
 * @returns title.
 */
function getTaskRowPreviewTitle(
  tableInstance?: Table<HCAAtlasTrackerListValidationRecord>
): string | undefined {
  const { getRowPreviewRow } = tableInstance || {};
  const task = getEntityFromRowData(getRowPreviewRow?.(), isTask);
  return task?.description;
}

/**
 * Returns component atlas or source dataset tissue column def.
 * @returns ColumnDef.
 */
function getTissueColumnDef<
  T extends HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset
>(): ColumnDef<T> {
  return {
    accessorKey: "tissue",
    cell: ({ row }) => C.NTagCell(buildTissue(row.original)),
    header: "Tissue",
  };
}
