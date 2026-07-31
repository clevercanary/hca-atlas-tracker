import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerComponentAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL, getRouteURL } from "@/app/common/utils";
import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { FormManager } from "@/app/hooks/useFormManager/common/entities";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { ROUTE } from "@/app/routes/constants";
import { useQueryClient } from "@tanstack/react-query";
import Router from "next/router";
import { useCallback } from "react";
import { ViewIntegratedObjectData } from "../common/entities";
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
          onSuccess: () => {
            // Always invalidate so returning to the detail shows fresh data;
            // navigate away only when an onward URL is provided.
            queryClient.invalidateQueries({
              queryKey: [
                INTEGRATED_OBJECT,
                pathParameter.atlasId,
                pathParameter.componentAtlasId,
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
function mapPayload(payload: ViewIntegratedObjectData): Payload {
  return { capUrl: payload.capUrl || null, downloadName: payload.downloadName };
}
