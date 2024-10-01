import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerUser } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../common/entities";
import { getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../routes/constants";
import { NewUserData } from "../common/entities";

export const useAddUserFormManager = (
  formMethod: FormMethod<NewUserData, HCAAtlasTrackerUser>
): FormManager => {
  const { onSubmit } = formMethod;

  const onDiscard = useCallback((url?: string) => {
    Router.push(url ?? ROUTE.USERS);
  }, []);

  const onSave = useCallback(
    (payload: NewUserData, url?: string) => {
      onSubmit(API.CREATE_USER, METHOD.POST, payload, {
        onSuccess: (data) => onSuccess(data.id, url),
      });
    },
    [onSubmit]
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};

/**
 * Side effect "onSuccess"; redirects to the users page, or to the specified URL.
 * @param userId - User ID.
 * @param url - URL to redirect to.
 */
export function onSuccess(userId: number, url?: string): void {
  Router.push(url ?? getRouteURL(ROUTE.USERS));
}
