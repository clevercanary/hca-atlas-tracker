import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useErrorSnackbar } from "@/app/components/common/Snackbar/hooks/UseErrorSnackbar/hook";
import { SNACKBAR_SCOPE } from "@/app/components/common/Snackbar/types";
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
  // A failed delete (including a network-level error) is surfaced via the
  // app-level error snackbar (SnackbarProvider is mounted in _app); onDelete
  // resolves false rather than rejecting.
  const { dismissError, onError } = useErrorSnackbar(
    SNACKBAR_SCOPE.EDIT_INTEGRATED_OBJECT_SOURCE_DATASETS,
  );

  const onSuccess = useCallback((): void => {
    // Dismiss this feature's stale error from a previous attempt (scoped; see
    // useErrorSnackbar).
    dismissError();
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
  }, [dismissError, pathParameter, queryClient]);

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
