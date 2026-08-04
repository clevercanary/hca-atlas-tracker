import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { INTEGRATED_OBJECT } from "@/app/views/ComponentAtlasView/hooks/UseFetchComponentAtlas/query/constants";
import { FIELD_NAME } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/common/constants";
import { type ComponentAtlasSourceDatasetsEditData } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/common/entities";
import { INTEGRATED_OBJECT_SOURCE_DATASETS } from "@/app/views/IntegratedObjectSourceDatasetsView/hooks/UseFetchIntegratedObjectSourceDatasets/query/constants";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { type FormState } from "react-hook-form";

export const useComponentAtlasSourceDatasetsSelectionFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<
    ComponentAtlasSourceDatasetsEditData,
    HCAAtlasTrackerSourceDataset[]
  >,
  onClose: () => void,
): FormManager => {
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
            // Both the integrated object detail and its source datasets list
            // change when datasets are added.
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
            onClose();
          },
        },
      );
    },
    [defaultValues, onClose, onSubmit, pathParameter, queryClient],
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
