import { useAuth } from "@databiosphere/findable-ui/lib/providers/authentication/auth/hook";
import Router from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FieldValues } from "react-hook-form";
import { RouteValue } from "../../routes/entities";
import { useAuthorization } from "../useAuthorization";
import { FormMethod, YupValidatedFormValues } from "../useForm/common/entities";
import { useUserHasEditAuthorization } from "../useUserHasEditAuthorization/useUserHasEditAuthorization";
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
  {
    onDelete,
    onDiscard,
    onSave,
  }: {
    onDelete?: (path?: string) => void;
    onDiscard?: (path?: string) => void;
    onSave?: (payload: YupValidatedFormValues<T>, path?: string) => void;
  } = {},
  isDirty = formMethod?.formState.isDirty ?? false,
): UseFormManager => {
  const {
    authState: { isAuthenticated },
  } = useAuth();
  const { user } = useAuthorization();
  const { canEdit } = useUserHasEditAuthorization();
  const [pathRoute, setPathRoute] =
    useState<[string, RouteValue | undefined]>(); // Tuple: path and corresponding route.
  const [nextPath, nextRoute] = pathRoute || [];
  const { formState, handleSubmit } = formMethod || {};
  const {
    isSubmitSuccessful = false,
    isSubmitted = false,
    isSubmitting = false,
  } = formState || {};
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

  const onFormDelete = useCallback((): void => {
    onDelete?.(nextPath);
  }, [onDelete, nextPath]);

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
    [onSave, nextPath],
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
    [canEdit, isDirty],
  );

  useEffect(() => {
    return (): void => {
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
        isSubmitSuccessful: false,
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
      onDelete: onDelete
        ? handleSubmit?.(onFormDelete, onFormError)
        : undefined,
      onDiscard: onFormDiscard,
      onNavigate,
      onSave: handleSubmit?.(onFormSave, onFormError),
    },
    formStatus: {
      isDirty,
      isDisabled,
      isLeaving: Boolean(nextRoute),
      isReadOnly,
      isSubmitSuccessful,
      isSubmitted,
      isSubmitting,
    },
    getNextRoute,
    isLoading,
  };
};
