import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
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
    HCAAtlasTrackerSourceDataset
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
          onSuccess: () => {
            // Invalidate rather than setQueryData (the pattern the other edit
            // managers use): the PATCH returns the base source-dataset shape,
            // but the detail query holds the detail shape (base +
            // validationReports), so caching the response would drop
            // validationReports from the view. Invalidating refetches the full
            // detail shape instead. (If the PATCH is changed to return the
            // detail shape, this can setQueryData like the other managers.)
            queryClient.invalidateQueries({
              queryKey: [
                SOURCE_DATASET,
                pathParameter.atlasId,
                pathParameter.sourceDatasetId,
              ],
            });
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
