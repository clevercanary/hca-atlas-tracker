import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import {
  AtlasId,
  HCAAtlasTrackerAtlas,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../routes/constants";
import { AtlasEditData } from "../common/entities";

export const useEditAtlasFormManager = (
  atlasId: AtlasId,
  formMethod: FormMethod<AtlasEditData, HCAAtlasTrackerAtlas>
): FormManager => {
  const { onSubmit, reset } = formMethod;

  const onDiscard = useCallback((url?: string) => {
    Router.push(url ?? ROUTE.ATLASES);
  }, []);

  const onSave = useCallback(
    (payload: AtlasEditData, url?: string) => {
      onSubmit(getRequestURL(API.ATLAS, atlasId), METHOD.PUT, payload, {
        onReset: reset,
        onSuccess: (id) => onSuccess(id, url),
      });
    },
    [atlasId, reset, onSubmit]
  );

  return useFormManager(formMethod, onDiscard, onSave);
};

/**
 * Side effect "onSuccess"; redirects to the atlas page, or to the specified URL.
 * @param id - Atlas ID.
 * @param url - URL to redirect to.
 */
export function onSuccess(id: string, url?: string): void {
  Router.push(url ?? getRouteURL(ROUTE.ATLAS, id));
}
