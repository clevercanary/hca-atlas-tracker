import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../common/entities";
import { getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../routes/constants";
import { NewAtlasData } from "../common/entities";
import { getIdentifierId } from "../common/utils";

export const useAddAtlasFormManager = (
  formMethod: FormMethod<NewAtlasData, HCAAtlasTrackerAtlas>
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
    [onSubmit]
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
