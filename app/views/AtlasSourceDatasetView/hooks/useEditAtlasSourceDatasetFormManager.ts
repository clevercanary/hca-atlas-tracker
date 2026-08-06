import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerDetailSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, type PathParameter } from "@/app/common/entities";
import { getRequestURL, getRouteURL } from "@/app/common/utils";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { ROUTE } from "@/app/routes/constants";
import { type ViewAtlasSourceDatasetData } from "@/app/views/AtlasSourceDatasetView/common/entities";
import { useQueryClient } from "@tanstack/react-query";
import Router from "next/router";
import { useCallback } from "react";
import { SOURCE_DATASET } from "./UseFetchAtlasSourceDataset/query/constants";

type Payload = {
  capUrl: string | null;
  downloadName: string;
};

export const useEditAtlasSourceDatasetFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<
    ViewAtlasSourceDatasetData,
    HCAAtlasTrackerDetailSourceDataset
  >,
): FormManager => {
  const queryClient = useQueryClient();
  const { onSubmit, reset } = formMethod;

  const onDiscard = useCallback(
    (url?: string) => {
      Router.push(
        url ?? getRouteURL(ROUTE.ATLAS_SOURCE_DATASETS, pathParameter),
      );
    },
    [pathParameter],
  );

  const onSave = useCallback(
    (payload: ViewAtlasSourceDatasetData, url?: string) => {
      onSubmit(
        getRequestURL(API.ATLAS_SOURCE_DATASET, pathParameter),
        METHOD.PATCH,
        mapPayload(payload),
        {
          onReset: reset,
          onSuccess: (data) => {
            // The PATCH returns the same detail shape as the detail query, so
            // write the response back into the cache (no refetch round-trip);
            // this refreshes the detail whether we stay or navigate away. Cancel
            // any in-flight GET first: unlike invalidateQueries, setQueryData
            // doesn't cancel it, so a GET resolving after the save could clobber
            // the cache with pre-save data. (setQueryData is a no-op if data is
            // undefined.)
            const queryKey = [
              SOURCE_DATASET,
              pathParameter.atlasId,
              pathParameter.sourceDatasetId,
            ];
            queryClient.cancelQueries({ queryKey });
            queryClient.setQueryData(queryKey, data);
            if (url) Router.push(url);
          },
        },
      );
    },
    [onSubmit, pathParameter, queryClient, reset],
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};

/**
 * Maps the form data to the payload.
 * @param payload - Form data.
 * @returns Payload.
 */
function mapPayload(payload: ViewAtlasSourceDatasetData): Payload {
  return { capUrl: payload.capUrl || null, downloadName: payload.downloadName };
}
