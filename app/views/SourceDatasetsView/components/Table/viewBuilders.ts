import { type HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type FileDownloadCell } from "@/app/components/Entity/components/common/Table/components/TableCell/components/FileDownloadCell/fileDownloadCell";
import { type BasicCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/BasicCell/basicCell";
import { type CellContext } from "@tanstack/react-table";
import { type ComponentProps } from "react";

/**
 * Returns props for the "Download" column.
 * @param ctx - Cell context.
 * @param ctx.row - Row data.
 * @returns Props for the FileDownloadCell component.
 */
export function buildSourceDatasetDownload({
  row,
}: CellContext<HCAAtlasTrackerSourceDataset, unknown>): ComponentProps<
  typeof FileDownloadCell
> {
  const { original } = row;
  const { baseFileName: fileName, fileId, sizeBytes } = original;

  return { fileId, fileName, sizeBytes };
}

/**
 * Returns props for the "Dataset Title" column.
 * @param ctx - Cell context.
 * @param ctx.row - Row data.
 * @returns Props for the BasicCell component.
 */
export function buildSourceDatasetTitle({
  row,
}: CellContext<HCAAtlasTrackerSourceDataset, unknown>): ComponentProps<
  typeof BasicCell
> {
  return {
    value: row.original.title,
  };
}
