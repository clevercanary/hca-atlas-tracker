import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../routes/constants";
import { getIdentifierId } from "../../AddNewAtlasView/common/utils";
import { AtlasEditData } from "../common/entities";

export const useEditAtlasFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<AtlasEditData, HCAAtlasTrackerAtlas>,
): FormManager => {
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
          onSuccess: (data) => onSuccess(data.id, url),
        },
      );
    },
    [onSubmit, pathParameter, reset],
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
