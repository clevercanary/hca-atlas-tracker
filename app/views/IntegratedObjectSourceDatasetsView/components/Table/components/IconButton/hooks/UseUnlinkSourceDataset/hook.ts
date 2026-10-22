import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { type IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { useEditIntegratedObjectSourceDatasets } from "@/app/views/IntegratedObjectSourceDatasetsView/providers/editIntegratedObjectSourceDatasets/hook";
import { useCallback, useState } from "react";
import { type UseUnlinkSourceDataset } from "./types";
import { unlinkSourceDataset } from "./utils";

/**
 * Unlinks one source dataset from the integrated object being viewed.
 *
 * `onDelete` never rejects: a failed unlink is surfaced via the app-level error
 * snackbar and clears `isPending`, so the button can be retried. A successful
 * one resolves once the list has refetched, which removes the row, and raises a
 * confirmation naming the source dataset and the integrated object — so the
 * toast appears as the row disappears. The titles are the ones on screen when
 * the unlink was clicked.
 * @param sourceDataset - Source dataset to unlink.
 * @returns unlink action and in-flight flag.
 */
export const useUnlinkSourceDataset = (
  sourceDataset: IntegratedObjectSourceDataset,
): UseUnlinkSourceDataset => {
  const [isPending, setIsPending] = useState(false);
  const { integratedObjectTitle, onDelete } =
    useEditIntegratedObjectSourceDatasets();
  const { onOpenSuccess } = useSnackbar();

  const onUnlink = useCallback(
    (): Promise<void> =>
      unlinkSourceDataset(
        sourceDataset,
        integratedObjectTitle,
        onDelete,
        onOpenSuccess,
        setIsPending,
      ),
    [integratedObjectTitle, onDelete, onOpenSuccess, sourceDataset],
  );

  return { isPending, onUnlink };
};
