import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { FormManager } from "@/app/hooks/useFormManager/common/entities";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { fetchData } from "@/app/providers/fetchDataState/actions/fetchData/dispatch";
import { INTEGRATED_OBJECT } from "@/app/views/ComponentAtlasView/hooks/UseFetchComponentAtlas/query/constants";
import { INTEGRATED_OBJECT_SOURCE_DATASETS } from "@/app/views/IntegratedObjectSourceDatasetsView/hooks/useFetchIntegratedObjectSourceDatasets";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { FormState } from "react-hook-form";
import { FIELD_NAME } from "../common/constants";
import { ComponentAtlasSourceDatasetsEditData } from "../common/entities";

export const useComponentAtlasSourceDatasetsSelectionFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<
    ComponentAtlasSourceDatasetsEditData,
    HCAAtlasTrackerSourceDataset[]
  >,
  onClose: () => void,
): FormManager => {
  const { fetchDataDispatch } = useFetchDataState();
  const queryClient = useQueryClient();
  const {
    formState: { defaultValues },
    onSubmit,
  } = formMethod;

  const onDiscard = useCallback(() => {
    onClose();
  }, [onClose]);

  const onSave = useCallback(
    (payload: ComponentAtlasSourceDatasetsEditData) => {
      onSubmit(
        getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
        METHOD.POST,
        filterDefaultValues(payload, defaultValues),
        {
          onSuccess: () => {
            // The integrated object detail (React Query) and its still-legacy
            // source datasets list both change when datasets are added.
            queryClient.invalidateQueries({
              queryKey: [
                INTEGRATED_OBJECT,
                pathParameter.atlasId,
                pathParameter.componentAtlasId,
              ],
            });
            fetchDataDispatch(fetchData([INTEGRATED_OBJECT_SOURCE_DATASETS]));
            onClose();
          },
        },
      );
    },
    [
      defaultValues,
      fetchDataDispatch,
      onClose,
      onSubmit,
      pathParameter,
      queryClient,
    ],
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};

/**
 * Returns the payload with the default values filtered out (default values are already linked).
 * @param payload - Payload.
 * @param defaultValues - Form default values.
 * @returns payload with the default values filtered out.
 */
function filterDefaultValues(
  payload: ComponentAtlasSourceDatasetsEditData,
  defaultValues: FormState<ComponentAtlasSourceDatasetsEditData>["defaultValues"],
): ComponentAtlasSourceDatasetsEditData {
  const sourceDatasetIds = payload[FIELD_NAME.SOURCE_DATASET_IDS];
  const defaultSourceDatasetIds =
    defaultValues?.[FIELD_NAME.SOURCE_DATASET_IDS];
  if (!defaultSourceDatasetIds) return payload;
  return {
    ...payload,
    sourceDatasetIds: sourceDatasetIds.filter(
      (sourceDatasetId) => !defaultSourceDatasetIds.includes(sourceDatasetId),
    ),
  };
}
