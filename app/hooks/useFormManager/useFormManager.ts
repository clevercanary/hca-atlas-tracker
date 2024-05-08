import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import Router from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FieldValues } from "react-hook-form";
import { ROLE } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { RouteValue } from "../../routes/entities";
import { useAuthorization } from "../useAuthorization";
import { FormMethod, YupValidatedFormValues } from "../useForm/common/entities";
import {
  FormAccess,
  FormAction,
  FormStatus,
  GetNextRouteFn,
} from "./common/entities";

export interface UseFormManager {
  access: FormAccess;
  formAction?: FormAction;
  formStatus: FormStatus;
  getNextRoute?: GetNextRouteFn;
  isLoading: boolean;
}

export const useFormManager = <T extends FieldValues, R = undefined>(
  formMethod?: FormMethod<T, R>,
  onDiscard?: (path?: string) => void,
  onSave?: (payload: YupValidatedFormValues<T>, path?: string) => void,
  isDirty = formMethod?.formState.isDirty ?? false
): UseFormManager => {
  const { isAuthenticated } = useAuthentication();
  const { user } = useAuthorization();
  const [pathRoute, setPathRoute] =
    useState<[string, RouteValue | undefined]>(); // Tuple: path and corresponding route.
  const [nextPath, nextRoute] = pathRoute || [];
  const { formState, handleSubmit } = formMethod || {};
  const {
    isSubmitSuccessful = false,
    isSubmitted = false,
    isSubmitting = false,
  } = formState || {};
  const canEdit = user?.role === ROLE.CONTENT_ADMIN;
  const access: FormAccess = {
    canEdit,
    canView: isAuthenticated,
  };
  const isDisabled =
    !isDirty || isSubmitting || (isSubmitted && isSubmitSuccessful);
  const isLoading = isAuthenticated ? !user : false;
  const isReadOnly = !canEdit;

  const getNextRoute = useCallback((): RouteValue | undefined => {
    return nextRoute;
  }, [nextRoute]);

  const onCancel = useCallback((): void => {
    setPathRoute(undefined);
  }, []);

  const onFormDiscard = useCallback((): void => {
    onDiscard?.(nextPath);
  }, [onDiscard, nextPath]);

  const onFormError = useCallback(() => {
    setPathRoute(undefined);
  }, []);

  const onFormSave = useCallback(
    (payload: YupValidatedFormValues<T>): void => {
      onSave?.(payload, nextPath);
    },
    [onSave, nextPath]
  );

  const onNavigate = useCallback(
    (path: string, route?: RouteValue): void => {
      if (canEdit && isDirty) {
        // User has access to edit form, and form has unsaved changes.
        setPathRoute([path, route]);
        return;
      }
      Router.push(path);
    },
    [canEdit, isDirty]
  );

  useEffect(() => {
    return () => {
      setPathRoute(undefined);
    };
  }, []);

  if (!formMethod) {
    return {
      access,
      formStatus: {
        isDirty: false,
        isDisabled: false,
        isLeaving: false,
        isReadOnly: false,
        isSubmitted: false,
        isSubmitting: false,
      },
      isLoading,
    };
  }

  return {
    access,
    formAction: {
      onCancel,
      onDiscard: onFormDiscard,
      onNavigate,
      onSave: handleSubmit?.(onFormSave, onFormError),
    },
    formStatus: {
      isDirty,
      isDisabled,
      isLeaving: Boolean(nextRoute),
      isReadOnly,
      isSubmitted,
      isSubmitting,
    },
    getNextRoute,
    isLoading,
  };
};
