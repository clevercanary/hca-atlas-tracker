import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { getRouteURL } from "@/app/common/utils";
import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { FormManager } from "@/app/hooks/useFormManager/common/entities";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { ROUTE } from "@/app/routes/constants";
import Router from "next/router";
import { useCallback } from "react";
import { NewAtlasData } from "../common/entities";
import { getIdentifierId } from "../common/utils";

export const useAddAtlasFormManager = (
  formMethod: FormMethod<NewAtlasData, HCAAtlasTrackerAtlas>,
): FormManager => {
  const { onSubmit } = formMethod;

  const onDiscard = useCallback((url?: string) => {
    Router.push(url ?? ROUTE.ATLASES);
  }, []);

  const onSave = useCallback(
    (payload: NewAtlasData, url?: string) => {
      onSubmit(API.CREATE_ATLAS, METHOD.POST, mapPayload(payload), {
        onSuccess: (data) => onSuccess(data.id, url),
      });
    },
    [onSubmit],
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};

/**
 * Maps the payload.
 * Strips ID from identifier CELLxGENE collection.
 * @param payload - Payload.
 * @returns payload.
 */
function mapPayload(payload: NewAtlasData): NewAtlasData {
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
