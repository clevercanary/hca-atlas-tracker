import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../routes/constants";
import { AtlasSourceDatasetEditData } from "../common/entities";

export const useEditAtlasSourceDatasetFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<
    AtlasSourceDatasetEditData,
    HCAAtlasTrackerSourceDataset
  >
): FormManager => {
  const { onSubmit, reset } = formMethod;

  const onDiscard = useCallback(
    (url?: string) => {
      Router.push(
        url ?? getRouteURL(ROUTE.ATLAS_SOURCE_DATASETS, pathParameter)
      );
    },
    [pathParameter]
  );

  const onSave = useCallback(
    (payload: AtlasSourceDatasetEditData, url?: string) => {
      onSubmit(
        getRequestURL(API.ATLAS_SOURCE_DATASET, pathParameter),
        METHOD.PATCH,
        payload,
        {
          onReset: reset,
          onSuccess: (data) => onSuccess(pathParameter, data.id, url),
        }
      );
    },
    [onSubmit, pathParameter, reset]
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};

/**
 * Side effect "onSuccess"; redirects to the source dataset page, or to the specified URL.
 * @param pathParameter - Path parameter.
 * @param sourceDatasetId - Source dataset ID.
 * @param url - URL to redirect to.
 */
export function onSuccess(
  pathParameter: PathParameter,
  sourceDatasetId: string,
  url?: string
): void {
  Router.push(
    url ??
      getRouteURL(ROUTE.ATLAS_SOURCE_DATASET, {
        ...pathParameter,
        sourceDatasetId,
      })
  );
}
