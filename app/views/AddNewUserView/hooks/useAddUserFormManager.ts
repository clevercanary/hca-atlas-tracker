import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerUser } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { getRouteURL } from "@/app/common/utils";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { ROUTE } from "@/app/routes/constants";
import { type NewUserData } from "@/app/views/AddNewUserView/common/entities";
import Router from "next/router";
import { useCallback } from "react";

export const useAddUserFormManager = (
  formMethod: FormMethod<NewUserData, HCAAtlasTrackerUser>,
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
    [onSubmit],
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};

/**
 * Side effect "onSuccess"; redirects to the users page, or to the specified URL.
 * @param userId - User ID.
 * @param url - URL to redirect to.
 */
export function onSuccess(userId: number, url?: string): void {
  Router.push(url ?? getRouteURL(ROUTE.USER, { userId: userId }));
}
