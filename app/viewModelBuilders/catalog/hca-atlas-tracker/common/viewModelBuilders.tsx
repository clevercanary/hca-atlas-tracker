import { LABEL } from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { STATUS_BADGE_COLOR } from "@databiosphere/findable-ui/lib/components/common/StatusBadge/statusBadge";
import { ANCHOR_TARGET } from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { LinkProps } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { COLUMN_DEF } from "@databiosphere/findable-ui/lib/components/Table/common/columnDef";
import {
  ColumnConfig,
  ViewContext,
} from "@databiosphere/findable-ui/lib/config/entities";
import { formatFileSize } from "@databiosphere/findable-ui/lib/utils/formatFileSize";
import {
  CellContext,
  ColumnDef,
  Row,
  RowData,
  Table,
} from "@tanstack/react-table";
import { BaseSyntheticEvent, ComponentProps, type JSX } from "react";
import { HCA_ATLAS_TRACKER_CATEGORY_LABEL } from "../../../../../site-config/hca-atlas-tracker/category";
import {
  HCA_TIER1_VALIDATION_STATUS_LABEL,
  NETWORKS,
  STATUS_LABEL,
  UNPUBLISHED,
} from "../../../../apis/catalog/hca-atlas-tracker/common/constants";
import {
  ATLAS_STATUS,
  CAP_INGEST_STATUS,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerListAtlas,
  HCAAtlasTrackerListComponentAtlas,
  HCAAtlasTrackerListSourceDataset,
  HCAAtlasTrackerListSourceStudy,
  HCAAtlasTrackerListValidationRecord,
  HCAAtlasTrackerSourceDataset,
  HCAAtlasTrackerSourceStudy,
  HCAAtlasTrackerUser,
  IngestionTaskCounts,
  LinkedAtlasSummary,
  Network,
  NetworkKey,
  SYSTEM,
  TASK_STATUS,
  VALIDATION_DESCRIPTION,
  VALIDATION_ID,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  getApiEntityFileVersion,
  getAtlasName,
  getSourceStudyCitation,
  getSourceStudyTaskStatus,
  isTask,
} from "../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../../../common/entities";
import { getRouteURL } from "../../../../common/utils";
import * as C from "../../../../components";
import { withBackOrigin } from "../../../../components/Layout/components/Detail/components/DetailViewHero/components/BackButton/utils";
import { CAPIngestStatusCell } from "../../../../components/Table/components/TableCell/components/CAPIngestStatusCell/capIngestStatusCell";
import { ICON_STATUS } from "../../../../components/Table/components/TableCell/components/IconStatusBadge/iconStatusBadge";
import { ROUTE } from "../../../../routes/constants";
import {
  formatDateToQuarterYear,
  formatISOToUTCDateTime,
  getDateFromIsoString,
} from "../../../../utils/date-fns";
import { buildSheetsUrl } from "../../../../utils/google-sheets";
import { AtlasIntegratedObject } from "../../../../views/ComponentAtlasesView/entities";
import { EXTRA_PROPS } from "./constants";
import {
  COMPONENT_NAME,
  DISEASE,
  ExtraPropsByComponentName,
  METADATA_KEY,
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
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
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
  atlas: HCAAtlasTrackerListAtlas,
): ComponentProps<typeof C.Link> => {
  return {
    label: atlas.name,
    url: getRouteURL(ROUTE.ATLAS_STATUS, { atlasId: atlas.id }),
  };
};

/**
 * Build props for the source datasets cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildAtlasSourceDatasetCount = (
  atlas: HCAAtlasTrackerListAtlas,
): ComponentProps<typeof C.Link> => {
  const { id: atlasId } = atlas;
  return {
    label: atlas.sourceDatasetCount,
    url: withBackOrigin(
      getRouteURL(ROUTE.ATLAS_SOURCE_DATASETS, { atlasId }),
      "ATLASES",
    ),
  };
};

/**
 * Build props for the atlas version cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildAtlasVersion = (
  atlas: HCAAtlasTrackerListAtlas,
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: `${atlas.generation}.${atlas.revision}`,
  };
};

/**
 * Build props for the biological network cell component.
 * @param entity - Entity.
 * @returns Props to be used for the cell.
 */
export const buildBioNetwork = (
  entity: HCAAtlasTrackerListAtlas,
): ComponentProps<typeof C.BioNetworkCell> => {
  return {
    networkKey: entity.bioNetwork,
  };
};

/**
 * Build props for the CAPIngestStatusCell shared by per-atlas and global lists, forwarding the
 * row's CellContext so the cell can read `row.original.capIngestStatus`. Constrained to row
 * types that carry `capIngestStatus` so wiring against a non-eligible row fails to typecheck.
 * @param _ - Row entity (unused; status is read via the cell's CellContext).
 * @param viewContext - View context carrying the row's CellContext.
 * @returns Props to be used for the CAPIngestStatusCell component.
 */
export const buildCapIngestStatus = <
  T extends { capIngestStatus: CAP_INGEST_STATUS },
>(
  _: T,
  viewContext: ViewContext<T>,
): ComponentProps<typeof C.CAPIngestStatusCell> => {
  const { cellContext } = viewContext;
  if (!cellContext) {
    throw new Error("CAPIngestStatusCell requires a row CellContext");
  }
  return cellContext as unknown as ComponentProps<typeof C.CAPIngestStatusCell>;
};

/**
 * Build props for the cell count cell component.
 * @param entity - Component atlas or source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildCellCount = (
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
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
  atlas: HCAAtlasTrackerListAtlas,
): ComponentProps<typeof C.Link> => {
  const { id: atlasId } = atlas;
  return {
    label: atlas.componentAtlasCount,
    url: withBackOrigin(
      getRouteURL(ROUTE.COMPONENT_ATLASES, { atlasId }),
      "ATLASES",
    ),
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
  AtlasIntegratedObject["baseFileName"]
>): ComponentProps<typeof C.LinkCell> => {
  const fileName = getValue();
  const atlasId = row.getValue("atlasId") as string;
  const componentAtlasId = row.getValue("id") as string;
  return {
    getValue: () => ({
      children: fileName,
      href: withBackOrigin(
        getRouteURL(ROUTE.COMPONENT_ATLAS, { atlasId, componentAtlasId }),
        "COMPONENT_ATLASES",
      ),
    }),
  };
};

/**
 * Build props for the component atlas version BasicCell component.
 * @param ctx - Cell context.
 * @param ctx.getValue - Get the value of the cell.
 * @returns Props to be used for the BasicCell component.
 */
export const buildComponentAtlasVersion = ({
  getValue,
}: CellContext<AtlasIntegratedObject, string>): ComponentProps<
  typeof C.BasicCell
> => {
  return {
    value: getValue(),
  };
};

/**
 * Build props for the "created at" BasicCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildCreatedAt = (
  task: HCAAtlasTrackerListValidationRecord,
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
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
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
  rows: Row<HCAAtlasTrackerListValidationRecord>[],
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
  task: HCAAtlasTrackerListValidationRecord,
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
  task: HCAAtlasTrackerListValidationRecord,
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
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: entity.geneCount?.toLocaleString() ?? "",
  };
};

/**
 * Build props for the HCA Tier-1 validation status BasicCell component. The
 * column is hidden by default and exists only so the right-hand filter sidebar
 * can render the HCA Tier-1 Status facet.
 * @param entity - List component atlas or list source dataset entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildHcaTier1ValidationStatus = (
  entity: HCAAtlasTrackerListComponentAtlas | HCAAtlasTrackerListSourceDataset,
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: HCA_TIER1_VALIDATION_STATUS_LABEL[entity.hcaTier1ValidationStatus],
  };
};

/**
 * Build props for the CAP ingestion counts TaskCountsCell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the TaskCountsCell.
 */
export const buildIngestionCountsCap = (
  atlas: HCAAtlasTrackerListAtlas,
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
  system: keyof IngestionTaskCounts,
): ComponentProps<typeof C.TaskCountsCell> => {
  const { completedCount, count } = atlas.ingestionTaskCounts[system];
  return {
    label: `${completedCount}/${count}`,
    url: getTaskCountUrlObject(
      atlas,
      system,
      VALIDATION_DESCRIPTION.INGEST_SOURCE_STUDY,
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
  atlas: HCAAtlasTrackerListAtlas,
): ComponentProps<typeof C.TaskCountsCell> => {
  return buildIngestionCountsForSystem(atlas, SYSTEM.HCA_DATA_REPOSITORY);
};

/**
 * Build props for the global integrated object list Atlas(es) LinksCell component.
 * @param integratedObject - Integrated object with linked atlas summaries.
 * @returns Props to be used for the LinksCell component.
 */
export const buildIntegratedObjectAtlases = (
  integratedObject: HCAAtlasTrackerListComponentAtlas,
): ComponentProps<typeof C.LinksCell> => {
  const { atlases, id: componentAtlasId } = integratedObject;
  return {
    links: atlases.map((atlas) => ({
      label: getAtlasName(atlas),
      url: withBackOrigin(
        getRouteURL(ROUTE.COMPONENT_ATLAS, {
          atlasId: atlas.id,
          componentAtlasId,
        }),
        "INTEGRATED_OBJECTS",
      ),
    })),
  };
};

/**
 * Build props for the global integrated object list BioNetworksCell component.
 * Renders one stacked row per unique network (component itself de-dupes).
 * @param integratedObject - Integrated object with linked atlas summaries.
 * @returns Props to be used for the BioNetworksCell component.
 */
export const buildIntegratedObjectBioNetworks = (
  integratedObject: HCAAtlasTrackerListComponentAtlas,
): ComponentProps<typeof C.BioNetworksCell> => {
  return {
    networkKeys: integratedObject.networks,
  };
};

/**
 * Build props for the global integrated object list file name TooltipLink.
 * Links to the atlas-scoped detail page on the primary atlas and surfaces the
 * integrated object's `title` as a hover tooltip; tooltip is suppressed when
 * the title is empty/null.
 * @param integratedObject - Integrated object with linked atlas summaries.
 * @returns Props to be used for the TooltipLink component.
 */
export const buildIntegratedObjectFileName = (
  integratedObject: HCAAtlasTrackerListComponentAtlas,
): ComponentProps<typeof C.TooltipLink> => {
  const {
    atlasId,
    baseFileName,
    id: componentAtlasId,
    title,
  } = integratedObject;
  return {
    label: baseFileName,
    tooltip: title,
    url: withBackOrigin(
      getRouteURL(ROUTE.COMPONENT_ATLAS, { atlasId, componentAtlasId }),
      "INTEGRATED_OBJECTS",
    ),
  };
};

/**
 * Build props for the global integrated object list source-dataset count BasicCell component.
 * @param integratedObject - Integrated object entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildIntegratedObjectSourceDatasetCount = (
  integratedObject: HCAAtlasTrackerListComponentAtlas,
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: integratedObject.sourceDatasetCount.toLocaleString(),
  };
};

/**
 * Build props for the global integrated object list ValidationStatusCell component.
 * Forwards the row's CellContext plus the componentAtlasId needed by
 * ValidationSummary to build validator detail links.
 * @param integratedObject - Integrated object entity.
 * @param viewContext - View context carrying the row's CellContext.
 * @returns Props to be used for the ValidationStatusCell component.
 */
export const buildIntegratedObjectValidationStatus = (
  integratedObject: HCAAtlasTrackerListComponentAtlas,
  viewContext: ViewContext<HCAAtlasTrackerListComponentAtlas>,
): ComponentProps<typeof C.ValidationStatusCell> => {
  const { cellContext } = viewContext;
  if (!cellContext) {
    throw new Error("ValidationStatusCell requires a row CellContext");
  }
  return {
    ...(cellContext as CellContext<
      HCAAtlasTrackerListComponentAtlas,
      HCAAtlasTrackerListComponentAtlas["validationStatus"]
    >),
    backOrigin: "INTEGRATED_OBJECTS",
    componentAtlasId: integratedObject.id,
    validationRoute: ROUTE.INTEGRATED_OBJECT_VALIDATION,
  };
};

/**
 * Build props for the integration lead cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildIntegrationLead = (
  atlas: HCAAtlasTrackerListAtlas,
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
  sourceStudy: HCAAtlasTrackerSourceStudy,
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
  atlas: HCAAtlasTrackerListAtlas,
): ComponentProps<typeof C.Link> {
  return {
    label: atlas?.metadataSpecificationUrl,
    noWrap: true,
    target: ANCHOR_TARGET.BLANK,
    url: atlas?.metadataSpecificationUrl ?? "",
  };
}

/**
 * Build props for the release date cell component. Renders a formatted date when
 * `publishedAt` is set, otherwise the `Draft` status pill.
 * @param entity - Atlas, component atlas, or source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildReleaseDate = (
  entity:
    | HCAAtlasTrackerListAtlas
    | HCAAtlasTrackerComponentAtlas
    | HCAAtlasTrackerSourceDataset,
): ComponentProps<typeof C.ReleaseDateCell> => {
  return {
    publishedAt: entity.publishedAt,
  };
};

/**
 * Build props for the "resolved at" BasicCell component.
 * @param task - Task entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildResolvedAt = (
  task: HCAAtlasTrackerListValidationRecord,
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: task.resolvedAt
      ? getDateFromIsoString(task.resolvedAt)
      : LABEL.EMPTY,
  };
};

/**
 * Build props for the global source dataset list Atlas(es) LinksCell component.
 * @param sourceDataset - Source dataset with linked atlas summaries.
 * @returns Props to be used for the LinksCell component.
 */
export const buildSourceDatasetAtlases = (
  sourceDataset: HCAAtlasTrackerListSourceDataset,
): ComponentProps<typeof C.LinksCell> => {
  const { atlases, id: sourceDatasetId } = sourceDataset;
  return {
    links: atlases.map((atlas) => ({
      label: getAtlasName(atlas),
      url: withBackOrigin(
        getRouteURL(ROUTE.ATLAS_SOURCE_DATASET, {
          atlasId: atlas.id,
          sourceDatasetId,
        }),
        "SOURCE_DATASETS",
      ),
    })),
  };
};

/**
 * Build props for the global source dataset list BioNetworksCell component.
 * Renders one stacked row per unique network (component itself de-dupes).
 * @param sourceDataset - Source dataset with linked atlas summaries.
 * @returns Props to be used for the BioNetworksCell component.
 */
export const buildSourceDatasetBioNetworks = (
  sourceDataset: HCAAtlasTrackerListSourceDataset,
): ComponentProps<typeof C.BioNetworksCell> => {
  return {
    networkKeys: sourceDataset.networks,
  };
};

/**
 * Build props for the source dataset count cell component.
 * @param componentAtlas - Component atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildSourceDatasetCount = (
  componentAtlas: AtlasIntegratedObject,
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: componentAtlas.sourceDatasetCount.toLocaleString(),
  };
};

/**
 * Build props for the global source dataset list file name TooltipLink.
 * Links to the atlas-scoped detail page on the primary atlas and surfaces the
 * source dataset's `title` as a hover tooltip; tooltip is suppressed when the
 * title is empty/null.
 * @param sourceDataset - Source dataset with linked atlas summaries.
 * @returns Props to be used for the TooltipLink component.
 */
export const buildSourceDatasetFileName = (
  sourceDataset: HCAAtlasTrackerListSourceDataset,
): ComponentProps<typeof C.TooltipLink> => {
  const { atlasId, baseFileName, id: sourceDatasetId, title } = sourceDataset;
  return {
    label: baseFileName,
    tooltip: title,
    url: withBackOrigin(
      getRouteURL(ROUTE.ATLAS_SOURCE_DATASET, { atlasId, sourceDatasetId }),
      "SOURCE_DATASETS",
    ),
  };
};

/**
 * Build props for the global source dataset list ValidationStatusCell component.
 * Reuses the atlas-scoped cell by forwarding the row's CellContext plus the
 * sourceDatasetId needed by ValidationSummary to build validator detail links.
 * @param sourceDataset - Source dataset entity.
 * @param viewContext - View context carrying the row's CellContext.
 * @returns Props to be used for the ValidationStatusCell component.
 */
export const buildSourceDatasetValidationStatus = (
  sourceDataset: HCAAtlasTrackerListSourceDataset,
  viewContext: ViewContext<HCAAtlasTrackerListSourceDataset>,
): ComponentProps<typeof C.ValidationStatusCell> => {
  const { cellContext } = viewContext;
  if (!cellContext) {
    throw new Error("ValidationStatusCell requires a row CellContext");
  }
  return {
    ...(cellContext as CellContext<
      HCAAtlasTrackerListSourceDataset,
      HCAAtlasTrackerListSourceDataset["validationStatus"]
    >),
    backOrigin: "SOURCE_DATASETS",
    sourceDatasetId: sourceDataset.id,
    validationRoute: ROUTE.ATLAS_SOURCE_DATASET_VALIDATION,
  };
};

/**
 * Build props for the global source study list Atlas(es) LinksCell component.
 * @param sourceStudy - Source study with linked atlas summaries.
 * @returns Props to be used for the LinksCell component.
 */
export const buildSourceStudyAtlases = (
  sourceStudy: HCAAtlasTrackerListSourceStudy,
): ComponentProps<typeof C.LinksCell> => {
  const { atlases, id: sourceStudyId } = sourceStudy;
  return {
    links: atlases.map((atlas) => ({
      label: getAtlasName(atlas),
      url: withBackOrigin(
        getRouteURL(ROUTE.ATLAS_SOURCE_STUDY, {
          atlasId: atlas.id,
          sourceStudyId,
        }),
        "SOURCE_STUDIES",
      ),
    })),
  };
};

/**
 * Build props for the global source study list BioNetworksCell component.
 * Renders one stacked row per unique network (component itself de-dupes).
 * @param sourceStudy - Source study with linked atlas summaries.
 * @returns Props to be used for the BioNetworksCell component.
 */
export const buildSourceStudyBioNetworks = (
  sourceStudy: HCAAtlasTrackerListSourceStudy,
): ComponentProps<typeof C.BioNetworksCell> => {
  return {
    networkKeys: sourceStudy.networks,
  };
};

/**
 * Get the HCA Data Repository status label for a source study, derived from
 * the underlying task statuses. Used by the column cell builder. A mirrored
 * implementation lives in `deriveHcaDataRepositoryLabel` (utils.ts) to break
 * a circular import — keep the two in sync if logic changes.
 * @param sourceStudy - Source study.
 * @returns one of the STATUS_LABEL values used for HCA data repository state.
 */
export function getSourceStudyHcaDataRepositoryLabel(
  sourceStudy: HCAAtlasTrackerSourceStudy,
): string {
  const ingestStatus = getSourceStudyTaskStatus(
    sourceStudy,
    VALIDATION_ID.SOURCE_STUDY_IN_HCA_DATA_REPOSITORY,
  );
  if (ingestStatus !== TASK_STATUS.DONE) return STATUS_LABEL.TODO;
  const primaryDataStatus = getSourceStudyTaskStatus(
    sourceStudy,
    VALIDATION_ID.SOURCE_STUDY_HCA_PROJECT_HAS_PRIMARY_DATA,
  );
  if (primaryDataStatus === TASK_STATUS.DONE) return STATUS_LABEL.FASTQS;
  if (primaryDataStatus === TASK_STATUS.BLOCKED)
    return STATUS_LABEL.FASTQS_BLOCKED;
  return STATUS_LABEL.NEEDS_FASTQS;
}

/**
 * Build props for the HCA Data Repository IconStatusBadge component.
 * @param sourceStudy - Source study entity.
 * @returns Props to be used for the IconStatusBadge component.
 */
export const buildSourceStudyHcaDataRepositoryStatus = (
  sourceStudy: HCAAtlasTrackerSourceStudy,
): ComponentProps<typeof C.IconStatusBadge> => {
  const label = getSourceStudyHcaDataRepositoryLabel(sourceStudy);
  switch (label) {
    case STATUS_LABEL.FASTQS:
      return { label, status: ICON_STATUS.DONE };
    case STATUS_LABEL.FASTQS_BLOCKED:
      return { label, status: ICON_STATUS.BLOCKED };
    case STATUS_LABEL.NEEDS_FASTQS:
      return { label, status: ICON_STATUS.PARTIALLY_COMPLETE };
    default:
      return { label, status: ICON_STATUS.REQUIRED };
  }
};

/**
 * Build props for the source study journal BasicCell component. The column is
 * hidden by default and exists only so the right-hand filter sidebar can
 * render the Journal facet on the global Source Studies list.
 * @param sourceStudy - Source study entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildSourceStudyJournal = (
  sourceStudy: HCAAtlasTrackerSourceStudy,
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: sourceStudy.journal ?? UNPUBLISHED,
  };
};

/**
 * Build props for the global source study list Name TooltipLink.
 * Picks a representative atlas via `pickPrimaryListAtlas` (deterministic sort:
 * isLatest desc → generation desc → revision desc → shortName asc) to host
 * the detail link, and surfaces the study `title` as a hover tooltip; tooltip
 * is suppressed when the title is empty/null.
 * @param sourceStudy - Source study with linked atlas summaries.
 * @returns Props to be used for the TooltipLink component.
 */
export const buildSourceStudyName = (
  sourceStudy: HCAAtlasTrackerListSourceStudy,
): ComponentProps<typeof C.TooltipLink> => {
  const { atlases, id: sourceStudyId, title } = sourceStudy;
  const linkAtlas = pickPrimaryListAtlas(atlases);
  return {
    label: getSourceStudyCitation(sourceStudy),
    tooltip: title,
    url: linkAtlas
      ? withBackOrigin(
          getRouteURL(ROUTE.ATLAS_SOURCE_STUDY, {
            atlasId: linkAtlas.id,
            sourceStudyId,
          }),
          "SOURCE_STUDIES",
        )
      : "",
  };
};

/**
 * Build props for the source study publication Link component.
 * @param sourceStudy - Source study entity.
 * @returns Props to be used for the Link component.
 */
export const buildSourceStudyPublication = (
  sourceStudy: HCAAtlasTrackerSourceStudy,
): ComponentProps<typeof C.Link> => {
  const { doi } = sourceStudy;
  return {
    label: doi === null ? "" : C.OpenInNewIcon({}),
    url: getDOILink(doi),
  };
};

/**
 * Build props for the global source study list publication status BasicCell.
 * Reads the derived field set by the input mapper; the column itself is
 * hidden in table options and only exposes the data for facet filtering.
 * @param sourceStudy - Source study entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildSourceStudyPublicationStatus = (
  sourceStudy: HCAAtlasTrackerListSourceStudy,
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: sourceStudy.publicationStatus,
  };
};

/**
 * Build props for the global source study list source-dataset count BasicCell component.
 * @param sourceStudy - Source study entity.
 * @returns Props to be used for the BasicCell component.
 */
export const buildSourceStudySourceDatasetCount = (
  sourceStudy: HCAAtlasTrackerListSourceStudy,
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: sourceStudy.sourceDatasetCount.toLocaleString(),
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
  sourceStudy: HCAAtlasTrackerSourceStudy,
): ComponentProps<typeof C.Link> => {
  const { id: sourceStudyId } = sourceStudy;
  return {
    label: getSourceStudyCitation(sourceStudy),
    url: withBackOrigin(
      getRouteURL(ROUTE.ATLAS_SOURCE_STUDY, {
        ...pathParameter,
        sourceStudyId,
      }),
      "ATLAS_SOURCE_STUDIES",
    ),
  };
};

/**
 * Build props for the source studies cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildSourceStudyCount = (
  atlas: HCAAtlasTrackerListAtlas,
): ComponentProps<typeof C.Link> => {
  const { id: atlasId } = atlas;
  return {
    label: atlas.sourceStudyCount,
    url: withBackOrigin(
      getRouteURL(ROUTE.ATLAS_SOURCE_STUDIES, { atlasId }),
      "ATLASES",
    ),
  };
};

/**
 * Build props for the status cell component.
 * @param atlas - Atlas entity.
 * @returns Props to be used for the cell.
 */
export const buildStatus = (
  atlas: HCAAtlasTrackerListAtlas,
): ComponentProps<typeof C.StatusBadge> => {
  return getAtlasStatusBadgeProps(atlas.status);
};

/**
 * Build props for the suspension type cell component.
 * @param entity - Component atlas or source dataset entity.
 * @returns Props to be used for the cell.
 */
export const buildSuspensionType = (
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
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
  task: HCAAtlasTrackerListValidationRecord,
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
  entity: HCAAtlasTrackerListValidationRecord | HCAAtlasTrackerListAtlas,
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
  task: HCAAtlasTrackerListValidationRecord,
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
  task: HCAAtlasTrackerListValidationRecord,
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
  viewContext: ViewContext<HCAAtlasTrackerListValidationRecord>,
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
  task: HCAAtlasTrackerListValidationRecord,
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
  _: unknown,
  viewContext: ViewContext<HCAAtlasTrackerListValidationRecord>,
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
  columns: ColumnConfig<HCAAtlasTrackerListValidationRecord>[],
): ComponentProps<typeof C.PreviewTask> => {
  return {
    columns: mapColumnsWithExtraProps(
      columns,
      getTaskRowPreviewExtraPropsByComponentName(),
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
  task: HCAAtlasTrackerListValidationRecord,
): ComponentProps<typeof C.Link> => {
  const { atlasIds, entityId: sourceStudyId } = task;
  const atlasId = atlasIds[0];
  return {
    label: task.publicationString ?? "",
    url: withBackOrigin(
      getRouteURL(ROUTE.ATLAS_SOURCE_STUDY, { atlasId, sourceStudyId }),
      "REPORTS",
    ),
  };
};

/**
 * Build props for the DOI cell component.
 * @param task - Task entity.
 * @returns Props to be used for the cell.
 */
export const buildTaskDoi = (
  task: HCAAtlasTrackerListValidationRecord,
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
  task: HCAAtlasTrackerListValidationRecord,
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
  task: HCAAtlasTrackerListValidationRecord,
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
  task: HCAAtlasTrackerListValidationRecord,
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
  entity: HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
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
  task: HCAAtlasTrackerListValidationRecord,
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
  user: HCAAtlasTrackerUser,
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
  user: HCAAtlasTrackerUser,
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
  user: HCAAtlasTrackerUser,
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
  user: HCAAtlasTrackerUser,
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
  user: HCAAtlasTrackerUser,
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
  user: HCAAtlasTrackerUser,
): ComponentProps<typeof C.NTagCell> => {
  return {
    label: getPluralizedMetadataLabel(
      METADATA_KEY.ROLE_ASSOCIATED_RESOURCE_NAMES,
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
  task: HCAAtlasTrackerListValidationRecord,
): ComponentProps<typeof C.BasicCell> => {
  return {
    value: task.validationType,
  };
};

/**
 * Get props for the publish status badge component for the given published-at value.
 * @param publishedAt - Atlas published-at value.
 * @returns status badge props.
 */
export function getAtlasPublishStatusBadgeProps(
  publishedAt: string | null,
): ComponentProps<typeof C.StatusBadge> {
  return publishedAt === null
    ? {
        color: STATUS_BADGE_COLOR.INFO,
        label: "Draft",
      }
    : {
        color: STATUS_BADGE_COLOR.SUCCESS,
        label: "Published",
      };
}

/**
 * Get props for the status badge component for the given atlas status.
 * @param status - Atlas status.
 * @returns status badge props.
 */
export function getAtlasStatusBadgeProps(
  status: ATLAS_STATUS,
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
  T extends HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
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
    getIntegratedObjectVersionColumnDef(),
    getComponentAtlasTitleColumnDef(),
    getIntegratedObjectFileSizeColumnDef(),
    {
      accessorKey: "fileEventTime",
      cell: ({ row }): JSX.Element | null => {
        const parts = formatISOToUTCDateTime(row.original.fileEventTime);
        if (!parts) return null;
        const [date, time] = parts;
        return (
          <div>
            <div>{date}</div>
            <div>{time}</div>
          </div>
        );
      },
      header: "Uploaded At",
      meta: { width: { max: "1fr", min: "160px" } },
    },
    {
      accessorKey: "publishedAt",
      cell: ({ row }) => C.ReleaseDateCell(buildReleaseDate(row.original)),
      header: "Release Date",
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
      cell: ({ row }) =>
        C.CAPCell({
          // `capIngestStatus` is not used for the display of CAP for integrated objects.
          capUrl: row.original.capUrl,
        }),
      enableSorting: true,
      header: "CAP URL",
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
        label: row.original.publicationString || UNPUBLISHED,
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
    accessorKey: "baseFileName",
    cell: ({ row }) =>
      C.RowSelectionCell({
        label: row.original.baseFileName,
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
    header: "Dataset Title",
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
  atlasLinkedDatasetsByStudyId: Map<string, HCAAtlasTrackerSourceDataset[]>,
): ColumnDef<HCAAtlasTrackerSourceStudy>[] {
  return [
    getSourceStudyTitleColumnDef(pathParameter),
    getSourceStudyPublicationColumnDef(),
    getSourceStudyMetadataSpreadsheetColumnDef(),
    getSourceStudySourceDatasetCountColumnDef(
      pathParameter,
      atlasLinkedDatasetsByStudyId,
    ),
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
  T extends HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
>(): ColumnDef<T> {
  return {
    accessorKey: "cellCount",
    cell: ({ row }) => C.BasicCell(buildCellCount(row.original)),
    header: "Cell Count",
    meta: { width: { max: "0.75fr", min: "120px" } },
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
    header: "Integrated Object Title",
    meta: { width: { max: "1fr", min: "136px" } },
  };
}

/**
 * Returns component atlas or source dataset disease column def.
 * @returns ColumnDef.
 */
function getDiseaseColumnDef<
  T extends HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
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
 * Returns the entity model from the table row.
 * @param row - Row.
 * @param isEntity - Entity type guard.
 * @returns entity.
 */
function getEntityFromRowData<T extends RowData>(
  row?: Row<T>,
  isEntity?: (rowData: RowData) => rowData is T,
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
  T extends HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
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
  T extends AtlasIntegratedObject,
>(): ColumnDef<T> {
  return {
    accessorKey: "download",
    cell: ({ row, table }): JSX.Element => {
      const {
        options: { meta },
      } = table;
      const { canEdit = false } = meta as { canEdit: boolean };
      const { baseFileName, fileId, sizeBytes } = row.original;
      return C.FileDownloadCell({
        disabled: !canEdit,
        fileId,
        fileName: baseFileName,
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
  AtlasIntegratedObject["baseFileName"]
> {
  return {
    accessorKey: "baseFileName",
    cell: (ctx) => C.LinkCell(buildComponentAtlasFileName(ctx)),
    header: "File Name",
    id: "baseFileName",
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
        backOrigin: "COMPONENT_ATLASES",
        componentAtlasId: ctx.row.original.id,
        validationRoute: ROUTE.INTEGRATED_OBJECT_VALIDATION,
      });
    },
    header: "Validation Summary",
    meta: { width: { max: "1fr", min: "200px" } },
  };
}

/**
 * Returns the integrated object version column def.
 * @returns ColumnDef.
 */
function getIntegratedObjectVersionColumnDef(): ColumnDef<
  AtlasIntegratedObject,
  string
> {
  return {
    accessorFn: getApiEntityFileVersion,
    cell: (ctx) => C.BasicCell(buildComponentAtlasVersion(ctx)),
    header: "Version",
    meta: { width: { max: "1fr", min: "120px" } },
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
        fileName: ctx.row.original.baseFileName,
        sizeBytes: ctx.row.original.sizeBytes,
      }),
    enableSorting: false,
    header: "Download",
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
    header: "Dataset Title",
    meta: { columnPinned: true },
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
  atlasLinkedDatasetsByStudyId: Map<string, HCAAtlasTrackerSourceDataset[]>,
): ColumnDef<HCAAtlasTrackerSourceStudy> {
  return {
    cell: ({ row }) =>
      C.LinkCell({
        getValue: () => ({
          children:
            atlasLinkedDatasetsByStudyId.get(row.original.id)?.length ?? 0,
          href: getRouteURL(ROUTE.ATLAS_SOURCE_STUDY_SOURCE_DATASETS, {
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
  pathParameter: PathParameter,
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
  T extends HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
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
  task?: VALIDATION_DESCRIPTION,
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
    EXTRA_PROPS.BIO_NETWORK_CELL,
  );
  return extraPropsByComponentName;
}

/**
 * Returns the title for the task row preview.
 * @param tableInstance - Table.
 * @returns title.
 */
function getTaskRowPreviewTitle(
  tableInstance?: Table<HCAAtlasTrackerListValidationRecord>,
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
  T extends HCAAtlasTrackerComponentAtlas | HCAAtlasTrackerSourceDataset,
>(): ColumnDef<T> {
  return {
    accessorKey: "tissue",
    cell: ({ row }) => C.NTagCell(buildTissue(row.original)),
    header: "Tissue",
  };
}

/**
 * Pick a representative atlas to host a link in the global source-study list.
 * Source studies have no intrinsic primary atlas (isPrimary is always false),
 * so sort deterministically (isLatest desc, generation desc, revision desc,
 * shortName asc) and take the first entry. Sorting — rather than relying on
 * input order — guarantees the chosen atlas (and link target) is stable
 * across requests even if the API returns rows in different orders.
 * @param linkedAtlases - Linked atlas summaries.
 * @returns selected atlas, or undefined if none are linked.
 */
function pickPrimaryListAtlas(
  linkedAtlases: LinkedAtlasSummary[],
): LinkedAtlasSummary | undefined {
  if (linkedAtlases.length === 0) return undefined;
  return [...linkedAtlases].sort((a, b) => {
    if (a.isLatest !== b.isLatest) return a.isLatest ? -1 : 1;
    if (a.generation !== b.generation) return b.generation - a.generation;
    if (a.revision !== b.revision) return b.revision - a.revision;
    return a.shortName.localeCompare(b.shortName);
  })[0];
}

/**
 * Returns NTagCell component.
 * @param propGetter - Fn that returns props for NTagCell component.
 * @returns NTagCell component.
 */
export function renderNTagCell<T extends RowData>(
  propGetter: (data: T) => ComponentProps<typeof C.NTagCell>,
): (ctx: CellContext<T, unknown>) => JSX.Element {
  return ({ row }) => {
    return C.NTagCell(propGetter(row.original));
  };
}

/**
 * Returns PinnedNTagCell component.
 * @param propGetter - Fn that returns props for PinnedNTagCell component.
 * @returns PinnedNTagCell component.
 */
export function renderPinnedNTagCell<T extends RowData>(
  propGetter: (data: T) => ComponentProps<typeof C.PinnedNTagCell>,
): (ctx: CellContext<T, unknown>) => JSX.Element {
  return ({ row }) => {
    return C.PinnedNTagCell(propGetter(row.original));
  };
}
