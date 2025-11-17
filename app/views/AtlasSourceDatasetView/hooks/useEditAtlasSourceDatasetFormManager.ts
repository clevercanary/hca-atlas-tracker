import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceDataset } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../common/utils";
import { useFetchDataState } from "../../../hooks/useFetchDataState";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { fetchData } from "../../../providers/fetchDataState/actions/fetchData/dispatch";
import { ROUTE } from "../../../routes/constants";
import { ViewAtlasSourceDatasetData } from "../common/entities";
import { SOURCE_DATASET } from "./useFetchAtlasSourceDataset";

type Payload = {
  capUrl: string | null;
};

export const useEditAtlasSourceDatasetFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<
    ViewAtlasSourceDatasetData,
    HCAAtlasTrackerSourceDataset
  >
): FormManager => {
  const { fetchDataDispatch } = useFetchDataState();
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
    (payload: ViewAtlasSourceDatasetData, url?: string) => {
      onSubmit(
        getRequestURL(API.ATLAS_SOURCE_DATASET, pathParameter),
        METHOD.PATCH,
        mapPayload(payload),
        {
          onReset: reset,
          onSuccess: () =>
            url
              ? Router.push(url)
              : fetchDataDispatch(fetchData([SOURCE_DATASET])),
        }
      );
    },
    [fetchDataDispatch, onSubmit, pathParameter, reset]
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};

/**
 * Maps the form data to the payload.
 * @param payload - Form data.
 * @returns Payload.
 */
function mapPayload(payload: ViewAtlasSourceDatasetData): Payload {
  return { capUrl: payload.capUrl || null };
}
