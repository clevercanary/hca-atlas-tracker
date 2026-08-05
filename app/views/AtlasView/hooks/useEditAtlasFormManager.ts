import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, type PathParameter } from "@/app/common/entities";
import { getRequestURL, getRouteURL } from "@/app/common/utils";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { ROUTE } from "@/app/routes/constants";
import { getIdentifierId } from "@/app/views/AddNewAtlasView/common/utils";
import { type AtlasEditData } from "@/app/views/AtlasView/common/entities";
import { useQueryClient } from "@tanstack/react-query";
import Router from "next/router";
import { useCallback } from "react";

export const useEditAtlasFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<AtlasEditData, HCAAtlasTrackerAtlas>,
): FormManager => {
  const queryClient = useQueryClient();
  const { onSubmit, reset } = formMethod;

  const onDiscard = useCallback((url?: string) => {
    Router.push(url ?? ROUTE.ATLASES);
  }, []);

  const onSave = useCallback(
    (payload: AtlasEditData, url?: string) => {
      onSubmit(
        getRequestURL(API.ATLAS, pathParameter),
        METHOD.PUT,
        mapPayload(payload),
        {
          onReset: reset,
          onSuccess: (data) => {
            // The edit is saved via fetchResource, which bypasses React Query,
            // so write the response back into the cached atlas. The PUT returns
            // the same shape as the detail query, so setQueryData refreshes the
            // detail view and edit form with no refetch round-trip; without it
            // they'd re-initialize from the pre-edit cache within the staleTime
            // window (and re-saving could revert the edit).
            queryClient.setQueryData([ATLAS, pathParameter.atlasId], data);
            onSuccess(data.id, url);
          },
        },
      );
    },
    [onSubmit, pathParameter, queryClient, reset],
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};

/**
 * Maps the payload.
 * Strips ID from identifier CELLxGENE collection.
 * @param payload - Payload.
 * @returns payload.
 */
function mapPayload(payload: AtlasEditData): AtlasEditData {
  return {
    ...payload,
    cellxgeneAtlasCollection: getIdentifierId(payload.cellxgeneAtlasCollection),
  };
}

/**
 * Side effect "onSuccess"; redirects to the atlas page, or to the specified URL.
 * @param atlasId - Atlas ID.
 * @param url - URL to redirect to.
 */
export function onSuccess(atlasId: string, url?: string): void {
  Router.push(url ?? getRouteURL(ROUTE.ATLAS, { atlasId }));
}
