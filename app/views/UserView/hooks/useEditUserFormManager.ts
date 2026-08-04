import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerUser } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, type PathParameter } from "@/app/common/entities";
import { getRequestURL, getRouteURL } from "@/app/common/utils";
import { USER } from "@/app/hooks/UseFetchUser/query/constants";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { ROUTE } from "@/app/routes/constants";
import { type UserEditData } from "@/app/views/UserView/common/entities";
import { useQueryClient } from "@tanstack/react-query";
import Router from "next/router";
import { useCallback } from "react";

export const useEditUserFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<UserEditData, HCAAtlasTrackerUser>,
): FormManager => {
  const queryClient = useQueryClient();
  const { onSubmit, reset } = formMethod;

  const onDiscard = useCallback((url?: string) => {
    Router.push(url ?? ROUTE.USERS);
  }, []);

  const onSave = useCallback(
    (payload: UserEditData, url?: string) => {
      onSubmit(getRequestURL(API.USER, pathParameter), METHOD.PATCH, payload, {
        onReset: reset,
        onSuccess: (data) => {
          // Response matches the cached user shape, so seed the detail cache.
          queryClient.setQueryData([USER, pathParameter.userId], data);
          onSuccess(data.id, url);
        },
      });
    },
    [onSubmit, pathParameter, queryClient, reset],
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
