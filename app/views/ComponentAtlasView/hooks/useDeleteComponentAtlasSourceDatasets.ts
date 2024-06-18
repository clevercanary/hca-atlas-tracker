import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { UseDeleteData, useDeleteData } from "../../../hooks/useDeleteData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { FetchDataActionKind } from "../../../providers/fetchDataState/fetchDataState";
import { ComponentAtlasDeleteSourceDatasetsData } from "../common/entities";

export const useDeleteComponentAtlasSourceDatasets = (
  pathParameter: PathParameter
): UseDeleteData<ComponentAtlasDeleteSourceDatasetsData> => {
  const { fetchDataDispatch } = useFetchDataState();
  const { onDelete } = useDeleteData<ComponentAtlasDeleteSourceDatasetsData>(
    getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
    undefined,
    {
      onSuccess: () => {
        fetchDataDispatch({
          payload: undefined,
          type: FetchDataActionKind.FetchData,
        });
      },
    }
  );

  return {
    onDelete,
  };
};
