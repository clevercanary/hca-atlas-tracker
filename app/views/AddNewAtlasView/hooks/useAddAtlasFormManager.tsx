import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { METHOD } from "../../../common/entities";
import { getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../routes/constants";
import { NewAtlasData } from "../common/entities";

export const useAddAtlasFormManager = (
  formMethod: FormMethod<NewAtlasData>
): FormManager => {
  const { onSubmit } = formMethod;

  const onDiscard = useCallback((url?: string) => {
    Router.push(url ?? ROUTE.ATLASES);
  }, []);

  const onSave = useCallback(
    (payload: NewAtlasData, url?: string) => {
      onSubmit(API.CREATE_ATLAS, METHOD.POST, payload, {
        onSuccess: (id) => onSuccess(id, url),
      });
    },
    [onSubmit]
  );

  return useFormManager(formMethod, onDiscard, onSave);
};

/**
 * Side effect "onSuccess"; redirects to the atlas page, or to the specified URL.
 * @param id - Atlas ID.
 * @param url - URL to redirect to.
 */
export function onSuccess(id: string, url?: string): void {
  Router.push(url ?? getRouteURL(ROUTE.EDIT_ATLAS, id));
}
