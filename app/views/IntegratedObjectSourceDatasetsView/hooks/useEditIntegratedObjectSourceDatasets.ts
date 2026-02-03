import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { getRequestURL } from "../../../common/utils";
import { useDeleteData } from "../../../hooks/useDeleteData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { fetchData } from "../../../providers/fetchDataState/actions/fetchData/dispatch";
import { INTEGRATED_OBJECT_SOURCE_DATASETS } from "./useFetchIntegratedObjectSourceDatasets";
import { INTEGRATED_OBJECT } from "../../ComponentAtlasView/hooks/useFetchComponentAtlas";
import { IntegratedObjectSourceDataset } from "../entities";
import { PathParameter } from "../../../common/entities";

export interface UseEditIntegratedObjectSourceDatasets {
  onDelete: (payload?: {
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }) => Promise<void>;
}

export const useEditIntegratedObjectSourceDatasets = (
  pathParameter: PathParameter,
): UseEditIntegratedObjectSourceDatasets => {
  const { fetchDataDispatch } = useFetchDataState();

  const { onDelete } = useDeleteData<{
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }>(
    getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
    undefined,
    {
      onSuccess: () => {
        fetchDataDispatch(
          fetchData([INTEGRATED_OBJECT, INTEGRATED_OBJECT_SOURCE_DATASETS]),
        );
      },
    },
  );

  return {
    onDelete,
  };
};
