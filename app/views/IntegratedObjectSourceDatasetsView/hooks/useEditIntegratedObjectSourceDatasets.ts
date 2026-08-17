import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { useDeleteData } from "@/app/hooks/UseDeleteData/hook";
import { INTEGRATED_OBJECT } from "@/app/views/ComponentAtlasView/hooks/UseFetchComponentAtlas/query/constants";
import { type IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { INTEGRATED_OBJECT_SOURCE_DATASETS } from "./UseFetchIntegratedObjectSourceDatasets/query/constants";

export interface UseEditIntegratedObjectSourceDatasets {
  onDelete: (payload?: {
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }) => Promise<boolean>;
}

export const useEditIntegratedObjectSourceDatasets = (
  pathParameter: PathParameter,
): UseEditIntegratedObjectSourceDatasets => {
  const queryClient = useQueryClient();
  const { onClose: closeSnackbar, onOpen: openSnackbar } = useSnackbar();

  // A failed delete (including a network-level error) is surfaced via the
  // error snackbar rendered by the page's SnackbarProvider; onDelete resolves
  // false rather than rejecting.
  const onError = useCallback(
    (error: Error): void => {
      openSnackbar(error.message);
    },
    [openSnackbar],
  );

  const onSuccess = useCallback((): void => {
    // Dismiss a stale error from a previous attempt.
    closeSnackbar();
    // Both the integrated object detail and its source datasets list change
    // when datasets are removed.
    queryClient.invalidateQueries({
      queryKey: [
        INTEGRATED_OBJECT,
        pathParameter.atlasId,
        pathParameter.componentAtlasId,
      ],
    });
    queryClient.invalidateQueries({
      queryKey: [
        INTEGRATED_OBJECT_SOURCE_DATASETS,
        pathParameter.atlasId,
        pathParameter.componentAtlasId,
      ],
    });
  }, [closeSnackbar, pathParameter, queryClient]);

  const { onDelete } = useDeleteData<{
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }>(
    getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
    undefined,
    { onError, onSuccess },
  );

  return {
    onDelete,
  };
};
