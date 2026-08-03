import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useDeleteData } from "@/app/hooks/useDeleteData";
import { INTEGRATED_OBJECT } from "@/app/views/ComponentAtlasView/hooks/UseFetchComponentAtlas/query/constants";
import { type IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { useQueryClient } from "@tanstack/react-query";
import { INTEGRATED_OBJECT_SOURCE_DATASETS } from "./UseFetchIntegratedObjectSourceDatasets/query/constants";

export interface UseEditIntegratedObjectSourceDatasets {
  onDelete: (payload?: {
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }) => Promise<void>;
}

export const useEditIntegratedObjectSourceDatasets = (
  pathParameter: PathParameter,
): UseEditIntegratedObjectSourceDatasets => {
  const queryClient = useQueryClient();

  const { onDelete } = useDeleteData<{
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }>(
    getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
    undefined,
    {
      onSuccess: () => {
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
      },
    },
  );

  return {
    onDelete,
  };
};
