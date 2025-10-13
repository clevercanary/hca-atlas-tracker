import { useCallback } from "react";
import { FormState } from "react-hook-form";
import { API } from "../../../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceDataset } from "../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../../../common/entities";
import { getRequestURL } from "../../../../../common/utils";
import { useFetchDataState } from "../../../../../hooks/useFetchDataState";
import { FormMethod } from "../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../../../hooks/useFormManager/useFormManager";
import { fetchData } from "../../../../../providers/fetchDataState/actions/fetchData/dispatch";
import { INTEGRATED_OBJECT_SOURCE_DATASETS } from "../../../../../views/ComponentAtlasView/hooks/useFetchComponentAtlasSourceDatasets";
import { FIELD_NAME } from "../common/constants";
import { SourceStudiesSourceDatasetsEditData } from "../common/entities";

export const useSourceStudiesSourceDatasetsFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<
    SourceStudiesSourceDatasetsEditData,
    HCAAtlasTrackerSourceDataset[]
  >,
  onClose: () => void
): FormManager => {
  const { fetchDataDispatch } = useFetchDataState();
  const {
    formState: { defaultValues },
    onSubmit,
  } = formMethod;

  const onDiscard = useCallback(() => {
    onClose();
  }, [onClose]);

  const onSave = useCallback(
    (payload: SourceStudiesSourceDatasetsEditData) => {
      onSubmit(
        getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
        METHOD.POST,
        filterDefaultValues(payload, defaultValues),
        {
          onSuccess: () => {
            fetchDataDispatch(fetchData([INTEGRATED_OBJECT_SOURCE_DATASETS]));
            onClose();
          },
        }
      );
    },
    [defaultValues, fetchDataDispatch, onClose, onSubmit, pathParameter]
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
  payload: SourceStudiesSourceDatasetsEditData,
  defaultValues: FormState<SourceStudiesSourceDatasetsEditData>["defaultValues"]
): SourceStudiesSourceDatasetsEditData {
  const sourceDatasetIds = payload[FIELD_NAME.SOURCE_DATASET_IDS];
  const defaultSourceDatasetIds =
    defaultValues?.[FIELD_NAME.SOURCE_DATASET_IDS];
  if (!defaultSourceDatasetIds) return payload;
  return {
    ...payload,
    sourceDatasetIds: sourceDatasetIds.filter(
      (sourceDatasetId) => !defaultSourceDatasetIds.includes(sourceDatasetId)
    ),
  };
}
