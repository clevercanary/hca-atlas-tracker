import { type IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { type EditIntegratedObjectSourceDatasetsContextProps } from "@/app/views/IntegratedObjectSourceDatasetsView/providers/editIntegratedObjectSourceDatasets/types";
import { type Dispatch, type SetStateAction } from "react";

/**
 * Unlinks the given source dataset, disabling the row's unlink button while
 * the request is in flight. On success the row is removed by the resulting
 * refetch; on failure (surfaced via the view's error snackbar) the button is
 * re-enabled so the unlink can be retried. Never rejects (`onDelete` routes
 * errors to the snackbar).
 * @param onDelete - Delete function from the edit context.
 * @param sourceDatasetId - ID of the source dataset to unlink.
 * @param setIsPending - Pending state setter for the row's unlink button.
 * @returns promise that settles when the unlink attempt completes.
 */
export async function unlinkSourceDataset(
  onDelete: EditIntegratedObjectSourceDatasetsContextProps["onDelete"],
  sourceDatasetId: IntegratedObjectSourceDataset["id"],
  setIsPending: Dispatch<SetStateAction<boolean>>,
): Promise<void> {
  setIsPending(true);
  const isDeleted = await onDelete({ sourceDatasetIds: [sourceDatasetId] });
  if (!isDeleted) setIsPending(false);
}
