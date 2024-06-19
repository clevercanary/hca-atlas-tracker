import { STATUS_BADGE_COLOR } from "@databiosphere/findable-ui/lib/components/common/StatusBadge/statusBadge";
import { LinkProps } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { CellContext, ColumnDef, Row } from "@tanstack/react-table";
import { NETWORKS } from "app/apis/catalog/hca-atlas-tracker/common/constants";
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
import { getSourceStudyCitation } from "../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../../common/entities";
import { getRouteURL } from "../../../../common/utils";
import * as C from "../../../../components";
import { SOURCE_STUDY_STATUS } from "../../../../components/Table/components/TableCell/components/SourceStudyStatusCell/sourceStudyStatusCell";
import { ROUTE } from "../../../../routes/constants";
import { formatDateToQuarterYear } from "../../../../utils/date-fns";
import { UseUnlinkComponentAtlasSourceDatasets } from "../../../../views/ComponentAtlasView/hooks/useUnlinkComponentAtlasSourceDatasets";

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
  entity: HCAAtlasTrackerListAtlas
): React.ComponentProps<typeof C.BioNetworkCell> => {
  return {
    networkKey: entity.bioNetwork,
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
 * Build props for the "created at" cell component.
 * @param task - Task entity.
 * @returns Props to be used for the cell.
 */
export const buildCreatedAt = (
  task: HCAAtlasTrackerListValidationRecord
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: getDateFromIsoString(task.createdAt),
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
 * Build props for the Cell component.
 * @param task - Task entity.
 * @returns Props to be used for the Cell component.
 */
export const buildEntityTitle = (
  task: HCAAtlasTrackerListValidationRecord
): React.ComponentProps<typeof C.Link> => {
  const { atlasIds, entityId: sourceStudyId } = task;
  const atlasId = atlasIds[0];
  return {
    label: task.entityTitle,
    url: getRouteURL(ROUTE.SOURCE_STUDY, { atlasId, sourceStudyId }),
  };
};

/**
 * Build props for the Cell component.
 * @param task - Task entity.
 * @returns Props to be used for the Cell component.
 */
export const buildEntityType = (
  task: HCAAtlasTrackerListValidationRecord
): React.ComponentProps<typeof C.Cell> => {
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
 * Build props for the "resolved at" cell component.
 * @param task - Task entity.
 * @returns Props to be used for the cell.
 */
export const buildResolvedAt = (
  task: HCAAtlasTrackerListValidationRecord
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: task.resolvedAt ? getDateFromIsoString(task.resolvedAt) : "",
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
 * Build props for the Cell component.
 * @param task - Task entity.
 * @returns Props to be used for the Cell component.
 */
export const buildSystem = (
  task: HCAAtlasTrackerListValidationRecord
): React.ComponentProps<typeof C.Cell> => {
  return {
    value: task.system,
  };
};

/**
 * Build props for the Cell component.
 * @param entity - Task or atlas entity.
 * @returns Props to be used for the Cell component.
 */
export const buildTargetCompletion = (
  entity: HCAAtlasTrackerListValidationRecord | HCAAtlasTrackerListAtlas
): React.ComponentProps<typeof C.Cell> => {
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
 * Build props for the BioNetworkCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BioNetworkCell component.
 */
export const buildTaskBioNetworks = (
  task: HCAAtlasTrackerListValidationRecord
): React.ComponentProps<typeof C.BioNetworkCell> => {
  return {
    networkKey: task.networks[0],
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
 * Build props for the TaskDescriptionSystemCell component.
 * @param task - Task entity.
 * @returns Props to be used for the TaskDescriptionSystemCell component.
 */
export const buildTaskDescriptionSystem = (
  task: HCAAtlasTrackerListValidationRecord
): React.ComponentProps<typeof C.TaskDescriptionSystemCell> => {
  return {
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
  return {
    label: task.publicationString ?? "",
    url: getDOILink(task.doi),
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
  return {
    label: task.doi,
    url: task.doi === "Unpublished" ? "" : getDOILink(task.doi),
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
 * Build props for the Cell component.
 * @param task - Task entity.
 * @returns Props to be used for the Cell component.
 */
export const buildValidationType = (
  task: HCAAtlasTrackerListValidationRecord
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
 * Returns the table column definition model for the atlas (edit mode) component atlases table.
 * @param pathParameter - Path parameter.
 * @returns Table column definition.
 */
export function getAtlasComponentAtlasesTableColumns(
  pathParameter: PathParameter
): ColumnDef<HCAAtlasTrackerComponentAtlas>[] {
  return [getComponentAtlasTitleColumnDef(pathParameter)];
}

/**
 * Returns the table column definition model for the atlas component source datasets table.
 * @param onUnlink - Unlink source datasets function.
 * @returns Table column definition.
 */
export function getAtlasComponentSourceDatasetsTableColumns(
  onUnlink: UseUnlinkComponentAtlasSourceDatasets["onUnlink"]
): ColumnDef<HCAAtlasTrackerSourceDataset>[] {
  return [
    getComponentAtlasSourceDatasetTitleColumnDef(),
    getComponentAtlasSourceDatasetPublicationColumnDef(),
    getComponentAtlasSourceDatasetSourceStudyCellCountColumnDef(),
    getComponentAtlasSourceDatasetUnlinkColumnDef(onUnlink),
  ];
}

/**
 * Returns the table column definition model for the atlas (edit mode) source datasets table.
 * @param pathParameter - Path parameter.
 * @returns Table column definition.
 */
export function getAtlasSourceDatasetsTableColumns(
  pathParameter: PathParameter
): ColumnDef<HCAAtlasTrackerSourceDataset>[] {
  return [
    getSourceDatasetTitleColumnDef(pathParameter),
    getSourceDatasetAssayColumnDef(),
    getSourceDatasetTissueColumnDef(),
    getSourceDatasetDiseaseColumnDef(),
    getSourceDatasetCellCountColumnDef(),
  ];
}

/**
 * Returns the source studies source datasets assay column definition model.
 * @returns Column definition.
 */
function getAtlasSourceStudiesSourceDatasetsAssayColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "assay",
    cell: () => C.Cell({ value: "TODO" }),
    header: "Assay",
    meta: { enableSortingInteraction: false },
  };
}

/**
 * Returns the source studies source datasets cell count column definition model.
 * @returns Column definition.
 */
function getAtlasSourceStudiesSourceDatasetsCellCountColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "cellCount",
    cell: ({ row }) =>
      C.Cell({ value: row.original.cellCount.toLocaleString() }),
    header: "Cell Count",
    meta: { enableSortingInteraction: false },
  };
}

/**
 * Returns the source studies source datasets disease column definition model.
 * @returns Column definition.
 */
function getAtlasSourceStudiesSourceDatasetsDiseaseColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "disease",
    cell: () => C.Cell({ value: "TODO" }),
    header: "Disease",
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
    getAtlasSourceStudiesSourceDatasetsAssayColumnDef(),
    getAtlasSourceStudiesSourceDatasetsDiseaseColumnDef(),
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
    getSourceStudyInHCADataRepositoryColumnDef(),
    getSourceStudyInCELLxGENEColumnDef(),
    getSourceStudyInCapColumnDef(),
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
    cell: ({ row }) =>
      C.Cell({ value: row.original.cellCount.toLocaleString() }),
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
    cell: ({ row }) => C.Cell({ value: row.original.publicationString }),
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
    cell: ({ row }) => C.Cell({ value: row.original.title }),
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
    header: "Component atlases",
  };
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
 * Get date-only string from ISO datetime with 4-digit year, defaulting to the full string if it's improperly formatted.
 * @param isoString - ISO datetime.
 * @returns date in YYYY-MM-DD format.
 */
function getDateFromIsoString(isoString: string): string {
  return /\d{4}-\d{2}-\d{2}/.exec(isoString)?.[0] ?? isoString;
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
 * @returns Column def.
 */
function getSourceDatasetAssayColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "assay",
    cell: () => C.Cell({ value: "TODO" }),
    header: "Assay",
  };
}

/**
 * Returns source dataset cell count column def.
 * @returns Column def.
 */
function getSourceDatasetCellCountColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "cellCount",
    cell: ({ row }) =>
      C.Cell({ value: row.original.cellCount.toLocaleString() }),
    header: "Cell Count",
  };
}

/**
 * Returns source dataset disease column def.
 * @returns Column def.
 */
function getSourceDatasetDiseaseColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "disease",
    cell: () => C.Cell({ value: "TODO" }),
    header: "Disease",
  };
}

/**
 * Returns source dataset tissue column def.
 * @returns Column def.
 */
function getSourceDatasetTissueColumnDef(): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "tissue",
    cell: () => C.Cell({ value: "TODO" }),
    header: "Tissue",
  };
}

/**
 * Returns source dataset title column def.
 * @param pathParameter - Path parameter.
 * @returns Column def.
 */
function getSourceDatasetTitleColumnDef(
  pathParameter: PathParameter
): ColumnDef<HCAAtlasTrackerSourceDataset> {
  return {
    accessorKey: "title",
    cell: ({ row }) =>
      C.ViewSourceDataset({
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
    href: ROUTE.TASKS,
    query: encodeURIComponent(JSON.stringify(params)),
  };
}
