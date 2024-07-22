import { LABEL } from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { STATUS_BADGE_COLOR } from "@databiosphere/findable-ui/lib/components/common/StatusBadge/statusBadge";
import { LinkProps } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import {
  ColumnConfig,
  ViewContext,
} from "@databiosphere/findable-ui/lib/config/entities";
import {
  CellContext,
  ColumnDef,
  Row,
  RowData,
  Table,
} from "@tanstack/react-table";
import {
  NETWORKS,
  UNPUBLISHED,
} from "app/apis/catalog/hca-atlas-tracker/common/constants";
import { BaseSyntheticEvent } from "react";
import { HCA_ATLAS_TRACKER_CATEGORY_LABEL } from "../../../../../site-config/hca-atlas-tracker/category";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerListAtlas,
  HCAAtlasTrackerListValidationRecord,
  HCAAtlasTrackerSourceDataset,
  HCAAtlasTrackerSourceStudy,
  Network,
  NetworkKey,
  TASK_STATUS,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  getSourceStudyCitation,
  isTask,
} from "../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../../common/entities";
import { getRouteURL } from "../../../../common/utils";
import * as C from "../../../../components";
import { SOURCE_STUDY_STATUS } from "../../../../components/Table/components/TableCell/components/SourceStudyStatusCell/sourceStudyStatusCell";
import { ROUTE } from "../../../../routes/constants";
import { formatDateToQuarterYear } from "../../../../utils/date-fns";
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
): React.ComponentProps<typeof C.NTagCell> => {
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
): React.ComponentProps<typeof C.Link> => {
  return {
    label: atlas.name,
    url: `/atlases/${encodeURIComponent(atlas.id)}`,
  };
};

/**
 * Build props for the atlas version cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildAtlasVersion = (
  atlas: HCAAtlasTrackerListAtlas
): React.ComponentProps<typeof C.BasicCell> => {
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
): React.ComponentProps<typeof C.BioNetworkCell> => {
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
): React.ComponentProps<typeof C.BasicCell> => {
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
): React.ComponentProps<typeof C.Link> => {
  const { id: atlasId } = atlas;
  return {
    label: atlas.componentAtlasCount,
    url: getRouteURL(ROUTE.COMPONENT_ATLASES, { atlasId }),
  };
};

/**
 * Build props for the component atlas title Link component.
 * @param pathParameter - Path parameter.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the Link component.
 */
export const buildComponentAtlasTitle = (
  pathParameter: PathParameter,
  componentAtlas: HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.Link> => {
  const { id: componentAtlasId } = componentAtlas;
  return {
    label: componentAtlas.title,
    url: getRouteURL(ROUTE.COMPONENT_ATLAS, {
      ...pathParameter,
      componentAtlasId,
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
): React.ComponentProps<typeof C.BasicCell> => {
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
): React.ComponentProps<typeof C.PinnedNTagCell> => {
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
): React.ComponentProps<typeof C.EditTasks> => {
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
): React.ComponentProps<typeof C.BasicCell> => {
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
): React.ComponentProps<typeof C.BasicCell> => {
  return {
    value: task.entityType,
  };
};

/**
 * Build props for the "in CAP" SourceStudyStatusCell component.
 * @param sourceStudy - Source study entity.
 * @returns Props to be used for the SourceStudyStatusCell component.
 */
export const buildInCap = (
  sourceStudy: HCAAtlasTrackerSourceStudy
): React.ComponentProps<typeof C.SourceStudyStatusCell> => {
  return {
    value: getSourceStudyInCap(sourceStudy),
  };
};

/**
 * Build props for the "in CELLxGENE" SourceStudyStatusCell component.
 * @param sourceStudy - Source study entity.
 * @returns Props to be used for the SourceStudyStatusCell component.
 */
export const buildInCellxGene = (
  sourceStudy: HCAAtlasTrackerSourceStudy
): React.ComponentProps<typeof C.SourceStudyStatusCell> => {
  return {
    value: getSourceStudyInCellxGene(sourceStudy),
  };
};

/**
 * Build props for the "in HCA data repository" SourceStudyStatusCell component.
 * @param sourceStudy - Source study entity.
 * @returns Props to be used for the SourceStudyStatusCell component.
 */
export const buildInHcaDataRepository = (
  sourceStudy: HCAAtlasTrackerSourceStudy
): React.ComponentProps<typeof C.SourceStudyStatusCell> => {
  return {
    value: getSourceStudyInHcaDataRepository(sourceStudy),
  };
};

/**
 * Build props for the integration lead cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildIntegrationLead = (
  atlas: HCAAtlasTrackerListAtlas
): React.ComponentProps<typeof C.NTagCell> => {
  return {
    label: "integration leads",
    values: atlas.integrationLeadName,
  };
};

/**
 * Build props for the "resolved at" BasicCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildResolvedAt = (
  task: HCAAtlasTrackerListValidationRecord
): React.ComponentProps<typeof C.BasicCell> => {
  return {
    value: task.resolvedAt
      ? getDateFromIsoString(task.resolvedAt)
      : LABEL.EMPTY,
  };
};

/**
 * Build props for the publication cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
// export const buildPublication = (
//   atlas: HCAAtlasTrackerListAtlas
// ): React.ComponentProps<typeof C.Cell> => {
//   return {
//     value: atlas.publicationPubString,
//   };
// };

/**
 * Build props for the source dataset count cell component.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildSourceDatasetCount = (
  componentAtlas: HCAAtlasTrackerComponentAtlas
): React.ComponentProps<typeof C.BasicCell> => {
  return {
    value: componentAtlas.sourceDatasetCount.toLocaleString(),
  };
};

/**
 * Build props for the source study publication Link component.
 * @param sourceStudy - Source study entity.
 * @returns Props to be used for the Link component.
 */
export const buildSourceStudyPublication = (
  sourceStudy: HCAAtlasTrackerSourceStudy
): React.ComponentProps<typeof C.Link> => {
  const { doi } = sourceStudy;
  return {
    label: getSourceStudyCitation(sourceStudy),
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
): React.ComponentProps<typeof C.Link> => {
  const { id: sourceStudyId, title } = sourceStudy;
  return {
    label: title ?? sourceStudyId,
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
): React.ComponentProps<typeof C.Link> => {
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
 * Build props for the suspension type cell component.
 * @param entity - Component atlas or source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildSuspensionType = (
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset
): React.ComponentProps<typeof C.NTagCell> => {
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
): React.ComponentProps<typeof C.BasicCell> => {
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
): React.ComponentProps<typeof C.BasicCell> => {
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
): React.ComponentProps<typeof C.NTagCell> => {
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
): React.ComponentProps<typeof C.NTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.ATLAS_VERSION),
    values: task.atlasVersions,
  };
};

/**
 * Build props for the task counts TaskCountsCell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the TaskCountsCell.
 */
export const buildTaskCounts = (
  atlas: HCAAtlasTrackerListAtlas
): React.ComponentProps<typeof C.TaskCountsCell> => {
  return {
    label: `${atlas.completedTaskCount}/${atlas.taskCount}`,
    url: getTaskCountUrlObject(atlas),
    value: getProgressValue(atlas.completedTaskCount, atlas.taskCount),
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
): React.ComponentProps<typeof C.ButtonTextPrimaryCell> => {
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
): React.ComponentProps<typeof C.BioNetworkCell> => {
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
): React.ComponentProps<
  typeof C.RowDrawer<HCAAtlasTrackerListValidationRecord>
> => {
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
): React.ComponentProps<typeof C.PreviewTask> => {
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
): React.ComponentProps<typeof C.Link> => {
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
): React.ComponentProps<typeof C.Link> => {
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
): React.ComponentProps<typeof C.Link> => {
  const url = task.relatedEntityUrl ?? LABEL.EMPTY;
  return {
    label: url,
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
): React.ComponentProps<typeof C.StatusBadge> => {
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
): React.ComponentProps<typeof C.NTagCell> => {
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
): React.ComponentProps<typeof C.NTagCell> => {
  return {
    label: getPluralizedMetadataLabel(METADATA_KEY.TISSUE),
    values: entity.tissue,
  };
};

/**
 * Build props for the BasicCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildValidationType = (
  task: HCAAtlasTrackerListValidationRecord
): React.ComponentProps<typeof C.BasicCell> => {
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
): React.ComponentProps<typeof C.BasicCell> => {
  return {
    value: atlas.wave,
  };
};

/**
 * Returns the table column definition model for the atlas (edit mode) component atlases table.
 * @param pathParameter - Path parameter.
 * @returns Table column definition.
 */
export function getAtlasComponentAtlasesTableColumns(
  pathParameter: PathParameter
): ColumnDef<HCAAtlasTrackerComponentAtlas>[] {
  return [
    getComponentAtlasTitleColumnDef(pathParameter),
    getComponentAtlasSourceDatasetCountColumnDef(),
    getComponentAtlasAssayColumnDef(),
    getComponentAtlasSuspensionTypeColumnDef(),
    getComponentAtlasTissueColumnDef(),
    getComponentAtlasDiseaseColumnDef(),
    getCellCountColumnDef(),
  ];
}

/**
 * Returns the table column definition model for the atlas component source datasets table.
 * @param onUnlink - Unlink source datasets function.
 * @param canEdit - Edit state for user.
 * @returns Table column definition.
 */
export function getAtlasComponentSourceDatasetsTableColumns(
  onUnlink: UseUnlinkComponentAtlasSourceDatasets["onUnlink"],
  canEdit: boolean
): ColumnDef<HCAAtlasTrackerSourceDataset>[] {
  const columnDefs = [
    getComponentAtlasSourceDatasetTitleColumnDef(),
    getComponentAtlasSourceDatasetPublicationColumnDef(),
    getSourceDatasetExploreColumnDef(),
    getSourceDatasetAssayColumnDef(),
    getSourceDatasetSuspensionTypeColumnDef(),
    getSourceDatasetTissueColumnDef(),
    getSourceDatasetDiseaseColumnDef(),
    getComponentAtlasSourceDatasetSourceStudyCellCountColumnDef(),
  ];
  if (canEdit) {
    columnDefs.push(getComponentAtlasSourceDatasetUnlinkColumnDef(onUnlink));
  }
  return columnDefs;
}

/**
 * Returns the table column definition model for the atlas (edit mode) source datasets table.
 * @param pathParameter - Path parameter.
 * @param canEdit - Edit state for user.
 * @returns Table column definition.
 */
export function getAtlasSourceDatasetsTableColumns(
  pathParameter: PathParameter,
  canEdit: boolean
): ColumnDef<HCAAtlasTrackerSourceDataset>[] {
  return [
    getSourceDatasetTitleColumnDef(pathParameter, canEdit),
    getSourceDatasetExploreColumnDef(),
    getSourceDatasetAssayColumnDef(),
    getSourceDatasetSuspensionTypeColumnDef(),
    getSourceDatasetTissueColumnDef(),
    getSourceDatasetDiseaseColumnDef(),
    getCellCountColumnDef(),
  ];
}

/**
 * Returns the source studies source datasets cell count column definition model.
 * @returns Column definition.
 */
function getAtlasSourceStudiesSourceDatasetsCellCountColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "cellCount",
    cell: ({ row }) => C.BasicCell(buildCellCount(row.original)),
    header: "Cell Count",
    meta: { enableSortingInteraction: false },
  };
}

/**
 * Returns the source studies source datasets publication string column definition model.
 * @returns Column definition.
 */
function getAtlasSourceStudiesSourceDatasetsPublicationStringColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
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
    meta: { columnPinned: true, enableSortingInteraction: false },
  };
}

/**
 * Returns the source studies source datasets title column definition model.
 * @returns Column definition.
 */
function getAtlasSourceStudiesSourceDatasetsTitleColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "title",
    cell: ({ row }: CellContext<HCAAtlasTrackerSourceDataset, unknown>) =>
      C.RowSelectionCell({
        label: row.original.title,
        row,
      }),
    header: "Title",
    meta: { enableSortingInteraction: false },
  };
}

/**
 * Returns the table column definition model for the atlas source studies source datasets table.
 * @returns Table column definition.
 */
export function getAtlasSourceStudiesSourceDatasetsTableColumns(): ColumnDef<HCAAtlasTrackerSourceDataset>[] {
  return [
    getAtlasSourceStudiesSourceDatasetsPublicationStringColumnDef(),
    getAtlasSourceStudiesSourceDatasetsTitleColumnDef(),
    getSourceDatasetExploreColumnDef(),
    getSourceDatasetAssayColumnDef(),
    getSourceDatasetSuspensionTypeColumnDef(),
    getSourceDatasetTissueColumnDef(),
    getSourceDatasetDiseaseColumnDef(),
    getAtlasSourceStudiesSourceDatasetsCellCountColumnDef(),
  ];
}

/**
 * Returns the table column definition model for the atlas (edit mode) source studies table.
 * @param pathParameter - Path parameter.
 * @returns Table column definition.
 */
export function getAtlasSourceStudiesTableColumns(
  pathParameter: PathParameter
): ColumnDef<HCAAtlasTrackerSourceStudy>[] {
  return [
    getSourceStudyTitleColumnDef(pathParameter),
    getSourceStudyPublicationColumnDef(),
    getSourceStudySourceDatasetCountColumnDef(pathParameter),
    getSourceStudyInCELLxGENEColumnDef(),
    getSourceStudyInCapColumnDef(),
    getSourceStudyInHCADataRepositoryColumnDef(),
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
 * Returns component atlas source dataset cell count column def.
 * @returns ColumnDef.
 */
function getComponentAtlasSourceDatasetSourceStudyCellCountColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "cellCount",
    cell: ({ row }) => C.BasicCell(buildCellCount(row.original)),
    header: "Cell count",
    meta: { enableSortingInteraction: false },
  };
}

/**
 * Returns component atlas source dataset publication column def.
 * @returns ColumnDef.
 */
function getComponentAtlasSourceDatasetPublicationColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "publicationString",
    cell: ({ row }) => C.BasicCell({ value: row.original.publicationString }),
    header: "Source study",
    meta: { enableSortingInteraction: false },
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
    header: "Title",
    meta: { columnPinned: true, enableSortingInteraction: false },
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
      C.IconButtonSecondary({
        children: C.UnLinkIcon({ color: "inkLight", fontSize: "small" }),
        onClick: () =>
          onUnlink({
            sourceDatasetIds: [row.original.id],
          }),
      }),
    header: "",
    meta: { enableSortingInteraction: false },
  };
}

/**
 * Returns component atlas assay column def.
 * @returns ColumnDef.
 */
function getComponentAtlasAssayColumnDef(): ColumnDef<HCAAtlasTrackerComponentAtlas> {
  return {
    accessorKey: "assay",
    cell: ({ row }) => C.NTagCell(buildAssay(row.original)),
    header: "Assay",
  };
}

/**
 * Returns component atlas disease column def.
 * @returns ColumnDef.
 */
function getComponentAtlasDiseaseColumnDef(): ColumnDef<HCAAtlasTrackerComponentAtlas> {
  return {
    accessorKey: "disease",
    cell: ({ row }) => C.PinnedNTagCell(buildDisease(row.original)),
    header: "Disease",
  };
}

/**
 * Returns component atlas suspension type column def.
 * @returns ColumnDef.
 */
function getComponentAtlasSuspensionTypeColumnDef(): ColumnDef<HCAAtlasTrackerComponentAtlas> {
  return {
    accessorKey: "suspensionType",
    cell: ({ row }) => C.NTagCell(buildSuspensionType(row.original)),
    header: "Suspension Type",
  };
}

/**
 * Returns component atlas source dataset count column def.
 * @returns ColumnDef.
 */
function getComponentAtlasSourceDatasetCountColumnDef(): ColumnDef<HCAAtlasTrackerComponentAtlas> {
  return {
    accessorKey: "sourceDatasetCount",
    cell: ({ row }) => C.BasicCell(buildSourceDatasetCount(row.original)),
    header: "Source Datasets",
  };
}

/**
 * Returns component atlas tissue column def.
 * @returns ColumnDef.
 */
function getComponentAtlasTissueColumnDef(): ColumnDef<HCAAtlasTrackerComponentAtlas> {
  return {
    accessorKey: "tissue",
    cell: ({ row }) => C.NTagCell(buildTissue(row.original)),
    header: "Tissue",
  };
}

/**
 * Returns component atlas title column def.
 * @param pathParameter - Path parameter.
 * @returns ColumnDef.
 */
function getComponentAtlasTitleColumnDef(
  pathParameter: PathParameter
): ColumnDef<HCAAtlasTrackerComponentAtlas> {
  return {
    accessorKey: "title",
    cell: ({ row }) =>
      C.Link(buildComponentAtlasTitle(pathParameter, row.original)),
    header: "Integration object",
  };
}

/**
 * Returns the DOI link.
 * @param doi - DOI.
 * @returns DOI link.
 */
export function getDOILink(doi: string | null): string {
  if (!doi || doi === UNPUBLISHED) return "";
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
 * Returns source dataset assay column def.
 * @param enableSortingInteraction - Enable sorting interaction.
 * @returns Column def.
 */
function getSourceDatasetAssayColumnDef(
  enableSortingInteraction = false
): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "assay",
    cell: ({ row }) => C.NTagCell(buildAssay(row.original)),
    header: "Assay",
    meta: { enableSortingInteraction },
  };
}

/**
 * Returns source dataset or component atlas cell count column def.
 * @returns Column def.
 */
function getCellCountColumnDef<
  T extends HCAAtlasTrackerSourceDataset | HCAAtlasTrackerComponentAtlas
>(): ColumnDef<T> {
  return {
    accessorKey: "cellCount",
    cell: ({ row }) => C.BasicCell(buildCellCount(row.original)),
    header: "Cell Count",
  };
}

/**
 * Returns source dataset disease column def.
 * @param enableSortingInteraction - Enable sorting interaction.
 * @returns Column def.
 */
function getSourceDatasetDiseaseColumnDef(
  enableSortingInteraction = false
): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "disease",
    cell: ({ row }) => C.PinnedNTagCell(buildDisease(row.original)),
    header: "Disease",
    meta: { enableSortingInteraction },
  };
}

/**
 * Returns source dataset explore column def.
 * @param enableSortingInteraction - Enable sorting interaction.
 * @returns Column def.
 */
function getSourceDatasetExploreColumnDef(
  enableSortingInteraction = false
): ColumnDef<HCAAtlasTrackerSourceDataset> {
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
    header: "Explore",
    meta: { enableSortingInteraction },
  };
}

/**
 * Returns source dataset suspension type column def.
 * @param enableSortingInteraction - Enable sorting interaction.
 * @returns Column def.
 */
function getSourceDatasetSuspensionTypeColumnDef(
  enableSortingInteraction = false
): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "suspensionType",
    cell: ({ row }) => C.NTagCell(buildSuspensionType(row.original)),
    header: "Suspension Type",
    meta: { enableSortingInteraction },
  };
}

/**
 * Returns source dataset tissue column def.
 * @param enableSortingInteraction - Enable sorting interaction.
 * @returns Column def.
 */
function getSourceDatasetTissueColumnDef(
  enableSortingInteraction = false
): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "tissue",
    cell: ({ row }) => C.NTagCell(buildTissue(row.original)),
    header: "Tissue",
    meta: { enableSortingInteraction },
  };
}

/**
 * Returns source dataset title column def.
 * @param pathParameter - Path parameter.
 * @param canEdit - Edit state for user.
 * @returns Column def.
 */
function getSourceDatasetTitleColumnDef(
  pathParameter: PathParameter,
  canEdit: boolean
): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "title",
    cell: ({ row }) =>
      C.ViewSourceDataset({
        canEdit,
        pathParameter,
        sourceDataset: row.original,
      }),
    header: "Title",
  };
}

/**
 * Returns source study is in Cap column def.
 * @returns Column def.
 */
function getSourceStudyInCapColumnDef(): ColumnDef<HCAAtlasTrackerSourceStudy> {
  return {
    accessorFn: getSourceStudyInCap,
    cell: ({ row }) => C.SourceStudyStatusCell(buildInCap(row.original)),
    header: "CAP",
  };
}

/**
 * Returns source study in CELLxGENE column def.
 * @returns Column def.
 */
function getSourceStudyInCELLxGENEColumnDef(): ColumnDef<HCAAtlasTrackerSourceStudy> {
  return {
    accessorFn: getSourceStudyInCellxGene,
    cell: ({ row }) => C.SourceStudyStatusCell(buildInCellxGene(row.original)),
    header: "CELLxGENE",
  };
}

/**
 * Returns source study in HCA data repository column def.
 * @returns Column def.
 */
function getSourceStudyInHCADataRepositoryColumnDef(): ColumnDef<HCAAtlasTrackerSourceStudy> {
  return {
    accessorFn: getSourceStudyInHcaDataRepository,
    cell: ({ row }) =>
      C.SourceStudyStatusCell(buildInHcaDataRepository(row.original)),
    header: "HCA Data Repository",
  };
}

/**
 * Get source study status describing whether a source study is known to be in CAP.
 * @param sourceStudy - Source study.
 * @returns whether the source study is in CAP.
 */
function getSourceStudyInCap(
  sourceStudy: HCAAtlasTrackerSourceStudy
): SOURCE_STUDY_STATUS {
  return sourceStudy.capId
    ? SOURCE_STUDY_STATUS.DONE
    : SOURCE_STUDY_STATUS.REQUIRED;
}

/**
 * Get source study status describing whether a source study is known to be in CELLxGENE.
 * @param sourceStudy - Source study.
 * @returns whether the source study is in CELLxGENE.
 */
function getSourceStudyInCellxGene(
  sourceStudy: HCAAtlasTrackerSourceStudy
): SOURCE_STUDY_STATUS {
  return sourceStudy.cellxgeneCollectionId
    ? SOURCE_STUDY_STATUS.DONE
    : SOURCE_STUDY_STATUS.REQUIRED;
}

/**
 * Get source study status describing whether a source study is known to be in the HCA data repository.
 * @param sourceStudy - Source study.
 * @returns whether the source study is in the HCA data repository.
 */
function getSourceStudyInHcaDataRepository(
  sourceStudy: HCAAtlasTrackerSourceStudy
): SOURCE_STUDY_STATUS {
  return sourceStudy.hcaProjectId
    ? SOURCE_STUDY_STATUS.DONE
    : SOURCE_STUDY_STATUS.REQUIRED;
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
 * @returns Column def.
 */
function getSourceStudySourceDatasetCountColumnDef(
  pathParameter: PathParameter
): ColumnDef<HCAAtlasTrackerSourceStudy> {
  return {
    accessorKey: "sourceDatasetCount",
    cell: ({ row }) =>
      C.Link({
        label: row.original.sourceDatasetCount.toLocaleString(),
        url: getRouteURL(ROUTE.SOURCE_DATASETS, {
          ...pathParameter,
          sourceStudyId: row.original.id,
        }),
      }),
    header: "Source Datasets",
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
    header: "Title",
  };
}

/**
 * Returns the URL object for the task count link.
 * @param atlas - Atlas entity.
 * @returns URL object for the task count link.
 */
function getTaskCountUrlObject(
  atlas: HCAAtlasTrackerListAtlas
): LinkProps["url"] {
  const params = {
    filter: [
      {
        categoryKey: "atlasNames",
        value: [atlas.name],
      },
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
