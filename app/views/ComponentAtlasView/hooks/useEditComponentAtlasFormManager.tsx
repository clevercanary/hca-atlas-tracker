import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import {
  AtlasId,
  ComponentAtlasId,
  HCAAtlasTrackerComponentAtlas,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../routes/constants";
import { ComponentAtlasEditData } from "../common/entities";

export const useEditComponentAtlasFormManager = (
  atlasId: AtlasId,
  componentAtlasId: ComponentAtlasId,
  formMethod: FormMethod<ComponentAtlasEditData, HCAAtlasTrackerComponentAtlas>
): FormManager => {
  const { onDelete: onDeleteComponentAtlas, onSubmit, reset } = formMethod;

  const onDelete = useCallback(() => {
    onDeleteComponentAtlas(
      getRequestURL(API.ATLAS_COMPONENT_ATLAS, atlasId, componentAtlasId),
      METHOD.DELETE,
      {
        onSuccess: () => onDeleteSuccess(atlasId),
      }
    );
  }, [atlasId, componentAtlasId, onDeleteComponentAtlas]);

  const onDiscard = useCallback(
    (url?: string) => {
      Router.push(url ?? getRouteURL(ROUTE.COMPONENT_ATLASES, atlasId));
    },
    [atlasId]
  );

  const onSave = useCallback(
    (payload: ComponentAtlasEditData, url?: string) => {
      onSubmit(
        getRequestURL(API.ATLAS_COMPONENT_ATLAS, atlasId, componentAtlasId),
        METHOD.PATCH,
        payload,
        {
          onReset: reset,
          onSuccess: (data) => onSuccess(atlasId, data.id, url),
        }
      );
    },
    [atlasId, componentAtlasId, onSubmit, reset]
  );

  return useFormManager(formMethod, { onDelete, onDiscard, onSave });
};

/**
 * Delete side effect "onSuccess"; redirects to the component atlases page.
 * @param {string} atlasId - Atlas ID.
 */
function onDeleteSuccess(atlasId: string): void {
  Router.push(getRouteURL(ROUTE.COMPONENT_ATLASES, atlasId));
}

/**
 * Submit side effect "onSuccess"; redirects to the component atlas page, or to the specified URL.
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
