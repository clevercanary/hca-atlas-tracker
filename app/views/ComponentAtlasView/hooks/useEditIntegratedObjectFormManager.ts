import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerComponentAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, type PathParameter } from "@/app/common/entities";
import { getRequestURL, getRouteURL } from "@/app/common/utils";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { ROUTE } from "@/app/routes/constants";
import { type ViewIntegratedObjectData } from "@/app/views/ComponentAtlasView/common/entities";
import { useQueryClient } from "@tanstack/react-query";
import Router from "next/router";
import { useCallback } from "react";
import { INTEGRATED_OBJECT } from "./UseFetchComponentAtlas/query/constants";

type Payload = {
  capUrl: string | null;
  downloadName: string;
};

export const useEditIntegratedObjectFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<
    ViewIntegratedObjectData,
    HCAAtlasTrackerComponentAtlas
  >,
): FormManager => {
  const queryClient = useQueryClient();
  const { onSubmit, reset } = formMethod;

  const onDiscard = useCallback(
    (url?: string) => {
      Router.push(url ?? getRouteURL(ROUTE.COMPONENT_ATLASES, pathParameter));
    },
    [pathParameter],
  );

  const onSave = useCallback(
    (payload: ViewIntegratedObjectData, url?: string) => {
      onSubmit(
        getRequestURL(API.ATLAS_COMPONENT_ATLAS, pathParameter),
        METHOD.PATCH,
        mapPayload(payload),
        {
          onReset: reset,
          onSuccess: (data) => {
            // The PATCH returns the same detail shape as the detail query, so
            // write the response back into the cache (no refetch round-trip);
            // this refreshes the detail whether we stay or navigate away.
            queryClient.setQueryData(
              [
                INTEGRATED_OBJECT,
                pathParameter.atlasId,
                pathParameter.componentAtlasId,
              ],
              data,
            );
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
function mapPayload(payload: ViewIntegratedObjectData): Payload {
  return { capUrl: payload.capUrl || null, downloadName: payload.downloadName };
}
