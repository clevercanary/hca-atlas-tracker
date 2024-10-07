import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerUser } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../routes/constants";
import { UserEditData } from "../common/entities";

export const useEditUserFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<UserEditData, HCAAtlasTrackerUser>
): FormManager => {
  const { onSubmit, reset } = formMethod;

  const onDiscard = useCallback((url?: string) => {
    Router.push(url ?? ROUTE.USERS);
  }, []);

  const onSave = useCallback(
    (payload: UserEditData, url?: string) => {
      onSubmit(getRequestURL(API.USER, pathParameter), METHOD.PATCH, payload, {
        onReset: reset,
        onSuccess: (data) => onSuccess(data.id, url),
      });
    },
    [onSubmit, pathParameter, reset]
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};

/**
 * Side effect "onSuccess"; redirects to the user page, or to the specified URL.
 * @param userId - User ID.
 * @param url - URL to redirect to.
 */
export function onSuccess(userId: number, url?: string): void {
  Router.push(url ?? getRouteURL(ROUTE.USER, { userId }));
}
