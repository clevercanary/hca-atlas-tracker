import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useDeleteData } from "@/app/hooks/useDeleteData";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { fetchData } from "@/app/providers/fetchDataState/actions/fetchData/dispatch";
import { INTEGRATED_OBJECT } from "@/app/views/ComponentAtlasView/hooks/UseFetchComponentAtlas/query/constants";
import { useQueryClient } from "@tanstack/react-query";
import { IntegratedObjectSourceDataset } from "../entities";
import { INTEGRATED_OBJECT_SOURCE_DATASETS } from "./useFetchIntegratedObjectSourceDatasets";

export interface UseEditIntegratedObjectSourceDatasets {
  onDelete: (payload?: {
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }) => Promise<void>;
}

export const useEditIntegratedObjectSourceDatasets = (
  pathParameter: PathParameter,
): UseEditIntegratedObjectSourceDatasets => {
  const { fetchDataDispatch } = useFetchDataState();
  const queryClient = useQueryClient();

  const { onDelete } = useDeleteData<{
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }>(
    getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
    undefined,
    {
      onSuccess: () => {
        // The integrated object detail (React Query) and its still-legacy
        // source datasets list both change when datasets are removed.
        queryClient.invalidateQueries({
          queryKey: [
            INTEGRATED_OBJECT,
            pathParameter.atlasId,
            pathParameter.componentAtlasId,
          ],
        });
        fetchDataDispatch(fetchData([INTEGRATED_OBJECT_SOURCE_DATASETS]));
      },
    },
  );

  return {
    onDelete,
  };
};
