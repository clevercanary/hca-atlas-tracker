import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import {
  AtlasId,
  HCAAtlasTrackerComponentAtlas,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../routes/constants";
import { NewComponentAtlasData } from "../common/entities";

export const useAddComponentAtlasFormManager = (
  atlasId: AtlasId,
  formMethod: FormMethod<NewComponentAtlasData, HCAAtlasTrackerComponentAtlas>
): FormManager => {
  const { onSubmit } = formMethod;

  const onDiscard = useCallback(
    (url?: string) => {
      Router.push(url ?? getRouteURL(ROUTE.COMPONENT_ATLASES, atlasId));
    },
    [atlasId]
  );

  const onSave = useCallback(
    (payload: NewComponentAtlasData, url?: string) => {
      onSubmit(
        getRequestURL(API.CREATE_ATLAS_COMPONENT_ATLAS, atlasId),
        METHOD.POST,
        payload,
        {
          onSuccess: (data) => onSuccess(atlasId, data.id, url),
        }
      );
    },
    [atlasId, onSubmit]
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};

/**
 * Side effect "onSuccess"; redirects to the component atlas page, or to the specified URL.
 * @param atlasId - Atlas ID.
 * @param componentAtlasId - Component atlas ID.
 * @param url - URL to redirect to.
 */
function onSuccess(
  atlasId: string,
  componentAtlasId: string,
  url?: string
): void {
  Router.push(
    url ?? getRouteURL(ROUTE.COMPONENT_ATLAS, atlasId, componentAtlasId)
  );
}
