import { JSX } from "react";
import { CellContext } from "@tanstack/react-table";
import * as C from "../../../../components";
import { getDOILink } from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { getRouteURL } from "../../../../common/utils";
import { ROUTE } from "../../../../routes/constants";
import { IntegratedObjectSourceDataset } from "../../entities";

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
