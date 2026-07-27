import { ANCHOR_TARGET } from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { LinkCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/LinkCell/linkCell";
import { CellContext } from "@tanstack/react-table";
import { HCAAtlasTrackerSourceStudy } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { getRouteURL } from "app/common/utils";
import { withBackOrigin } from "app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/utils";
import { ROUTE } from "app/routes/constants";
import { buildSheetsUrl } from "app/utils/google-sheets";
import { ComponentProps } from "react";
import { LinksCell } from "../../../../components/Index/components/LinksCell/linksCell";
import type { TableMeta } from "./entities";

/**
 * Returns props for the "Metadata Entry Sheet" column.
 * @param ctx - Cell context.
 * @param ctx.row - Row data.
 * @returns Props for the LinksCell component.
 */
export function buildMetadataSpreadsheets({
  row,
}: CellContext<HCAAtlasTrackerSourceStudy, unknown>): ComponentProps<
  typeof LinksCell
> {
  const { metadataSpreadsheets } = row.original;
  return {
    links: metadataSpreadsheets.map(({ id, title }) => {
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
 * Returns props for the "Datasets" column.
 * @param ctx - Cell context.
 * @param ctx.row - Row data.
 * @param ctx.table - Table instance.
 * @returns Props for the LinkCell component.
 */
export function buildSourceStudyDatasetCount({
  row,
  table,
}: CellContext<HCAAtlasTrackerSourceStudy, unknown>): ComponentProps<
  typeof LinkCell
> {
  const { original } = row;
  const { pathParameter } = (table.options.meta || {}) as TableMeta;
  const { sourceDatasetCount } = original;
  return {
    getValue: () => ({
      children: sourceDatasetCount,
      href: getRouteURL(ROUTE.ATLAS_SOURCE_STUDY_SOURCE_DATASETS, {
        ...pathParameter,
        sourceStudyId: row.original.id,
      }),
    }),
  };
}

/**
 * Build props for the source study title Link component.
 * @param ctx - Cell context.
 * @param ctx.getValue - Function to get the cell value.
 * @param ctx.row - Row data.
 * @param ctx.table - Table instance.
 * @returns Props to be used for the Link component.
 */
export function buildSourceStudyTitle({
  getValue,
  row,
  table,
}: CellContext<HCAAtlasTrackerSourceStudy, unknown>): ComponentProps<
  typeof Link
> {
  const { original } = row;
  const { pathParameter } = (table.options.meta || {}) as TableMeta;
  const { id: sourceStudyId } = original;
  return {
    label: getValue() as string,
    url: withBackOrigin(
      getRouteURL(ROUTE.ATLAS_SOURCE_STUDY, {
        ...pathParameter,
        sourceStudyId,
      }),
      "ATLAS_SOURCE_STUDIES",
    ),
  };
}
