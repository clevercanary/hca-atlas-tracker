import { type IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { type EditIntegratedObjectSourceDatasetsContextProps } from "@/app/views/IntegratedObjectSourceDatasetsView/providers/editIntegratedObjectSourceDatasets/types";

/**
 * Returns the confirmation shown once a source dataset has been unlinked from
 * an integrated object, naming both.
 * @param sourceDatasetTitle - Title of the unlinked source dataset.
 * @param integratedObjectTitle - Title of the integrated object; when it isn't
 * loaded, only the source dataset is named.
 * @returns success message.
 */
export function getUnlinkSuccessMessage(
  sourceDatasetTitle: string,
  integratedObjectTitle?: string,
): string {
  if (!integratedObjectTitle) return `Unlinked ${sourceDatasetTitle}`;
  return `Unlinked ${sourceDatasetTitle} from ${integratedObjectTitle}`;
}

/**
 * Unlinks a source dataset and confirms it once the list has refetched, or
 * clears the pending flag on failure so the button can be retried (the error
 * itself is raised by the request layer).
 * @param sourceDataset - Source dataset to unlink.
 * @param integratedObjectTitle - Title of the integrated object, for the
 * confirmation.
 * @param onDelete - Unlink request; never rejects.
 * @param onOpenSuccess - Raises the confirmation.
 * @param setIsPending - Sets the pending flag.
 */
export async function unlinkSourceDataset(
  sourceDataset: Pick<IntegratedObjectSourceDataset, "id" | "title">,
  integratedObjectTitle: string | undefined,
  onDelete: EditIntegratedObjectSourceDatasetsContextProps["onDelete"],
  onOpenSuccess: (message: string) => void,
  setIsPending: (isPending: boolean) => void,
): Promise<void> {
  setIsPending(true);
  const isDeleted = await onDelete({ sourceDatasetIds: [sourceDataset.id] });
  if (!isDeleted) {
    setIsPending(false);
    return;
  }
  onOpenSuccess(
    getUnlinkSuccessMessage(sourceDataset.title, integratedObjectTitle),
  );
}
