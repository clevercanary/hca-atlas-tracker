import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useDeleteData } from "../../../hooks/useDeleteData";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { fetchData } from "../../../providers/fetchDataState/actions/fetchData/dispatch";
import { ComponentAtlasDeleteSourceDatasetsData } from "../common/entities";
import { INTEGRATED_OBJECT_SOURCE_DATASETS } from "./useFetchComponentAtlasSourceDatasets";

export interface UseUnlinkComponentAtlasSourceDatasets {
  onUnlink: (payload?: ComponentAtlasDeleteSourceDatasetsData) => Promise<void>;
}

export const useUnlinkComponentAtlasSourceDatasets = (
  pathParameter: PathParameter
): UseUnlinkComponentAtlasSourceDatasets => {
  const { fetchDataDispatch } = useFetchDataState();
  const { onDelete } = useDeleteData<ComponentAtlasDeleteSourceDatasetsData>(
    getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
    undefined,
    {
      onSuccess: () => {
        fetchDataDispatch(fetchData(INTEGRATED_OBJECT_SOURCE_DATASETS));
      },
    }
  );

  return {
    onUnlink: onDelete,
  };
};
