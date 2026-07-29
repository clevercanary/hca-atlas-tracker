import { getRouteURL } from "@/app/common/utils";
import * as C from "@/app/components";
import { ROUTE } from "@/app/routes/constants";
import { getDOILink } from "@/app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { CellContext } from "@tanstack/react-table";
import { JSX } from "react";

/**
 * Renders file name as a link.
 * @param ctx - Cell context.
 * @param ctx.row - Row.
 * @returns Link cell.
 */
export function renderFileName({
  row,
}: CellContext<IntegratedObjectSourceDataset, unknown>): JSX.Element {
  return C.Link({
    label: row.original.baseFileName,
    url: getRouteURL(ROUTE.ATLAS_SOURCE_DATASET, {
      atlasId: row.original.atlasId,
      sourceDatasetId: row.original.id,
    }),
  });
}

/**
 * Renders publication string as a link.
 * @param ctx - Cell context.
 * @param ctx.row - Row.
 * @returns Link cell.
 */
export function renderPublicationString({
  row,
}: CellContext<IntegratedObjectSourceDataset, unknown>): JSX.Element {
  return C.Link({
    label: row.original.publicationString,
    url: getDOILink(row.original.doi),
  });
}
