import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { METHOD, type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
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

  const onSuccess = useCallback((): void => {
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
  }, [pathParameter, queryClient]);

  // A failed unlink is surfaced via the app-level error snackbar; onDelete
  // resolves false rather than rejecting. Every row hits this one URL and
  // differs only in `sourceDatasetIds`, which is what tells two rows apart.
  const { onDelete } = useDeleteData<{
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }>(
    getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
    METHOD.DELETE,
    { onSuccess },
  );

  return {
    onDelete,
  };
};
