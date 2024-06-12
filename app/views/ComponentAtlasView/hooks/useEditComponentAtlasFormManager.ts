import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../routes/constants";
import { ComponentAtlasEditData } from "../common/entities";

export const useEditComponentAtlasFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<ComponentAtlasEditData, HCAAtlasTrackerComponentAtlas>
): FormManager => {
  const { onDelete: onDeleteComponentAtlas, onSubmit, reset } = formMethod;

  const onDelete = useCallback(() => {
    onDeleteComponentAtlas(
      getRequestURL(API.ATLAS_COMPONENT_ATLAS, pathParameter),
      METHOD.DELETE,
      {
        onSuccess: () => onDeleteSuccess(pathParameter),
      }
    );
  }, [onDeleteComponentAtlas, pathParameter]);

  const onDiscard = useCallback(
    (url?: string) => {
      Router.push(url ?? getRouteURL(ROUTE.COMPONENT_ATLASES, pathParameter));
    },
    [pathParameter]
  );

  const onSave = useCallback(
    (payload: ComponentAtlasEditData, url?: string) => {
      onSubmit(
        getRequestURL(API.ATLAS_COMPONENT_ATLAS, pathParameter),
        METHOD.PATCH,
        payload,
        {
          onReset: reset,
          onSuccess: (data) => onSuccess(pathParameter, data.id, url),
        }
      );
    },
    [onSubmit, pathParameter, reset]
  );

  return useFormManager(formMethod, { onDelete, onDiscard, onSave });
};

/**
 * Delete side effect "onSuccess"; redirects to the component atlases page.
 * @param pathParameter - Path parameter.
 */
function onDeleteSuccess(pathParameter: PathParameter): void {
  Router.push(getRouteURL(ROUTE.COMPONENT_ATLASES, pathParameter));
}

/**
 * Submit side effect "onSuccess"; redirects to the component atlas page, or to the specified URL.
 * @param pathParameter - Path parameter.
 * @param componentAtlasId - Component atlas ID.
 * @param url - URL to redirect to.
 */
function onSuccess(
  pathParameter: PathParameter,
  componentAtlasId: string,
  url?: string
): void {
  Router.push(
    url ??
      getRouteURL(ROUTE.COMPONENT_ATLAS, { ...pathParameter, componentAtlasId })
  );
}
