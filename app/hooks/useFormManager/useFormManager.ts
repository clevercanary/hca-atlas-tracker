import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import Router from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FieldValues } from "react-hook-form";
import { FormMethod, YupValidatedFormValues } from "../useForm/common/entities";
import { FormAccess } from "./common/entities";

export interface UseFormManager {
  access: FormAccess;
  isDirty: boolean;
  isDisabled: boolean;
  isLeaving: boolean;
  isSubmitted: boolean;
  isSubmitting: boolean;
  onCancel?: () => void;
  onDiscard?: () => void;
  onNavigate?: (url: string) => void;
  onSave?: () => void;
}

export const useFormManager = <T extends FieldValues, R = undefined>(
  formMethod?: FormMethod<T, R>,
  onDiscard?: (url?: string) => void,
  onSave?: (payload: YupValidatedFormValues<T>, url?: string) => void,
  isDirty = formMethod?.formState.isDirty ?? false
): UseFormManager => {
  const { isAuthenticated } = useAuthentication();
  const [nextPath, setNextPath] = useState<string | undefined>();
  const { formState, handleSubmit } = formMethod || {};
  const {
    isSubmitSuccessful = false,
    isSubmitted = false,
    isSubmitting = false,
  } = formState || {};
  const isDisabled =
    !isDirty || isSubmitting || (isSubmitted && isSubmitSuccessful);
  const access: FormAccess = { canEdit: true, canView: isAuthenticated };

  const onCancel = useCallback((): void => {
    setNextPath(undefined);
  }, []);

  const onFormDiscard = useCallback((): void => {
    onDiscard?.(nextPath);
  }, [onDiscard, nextPath]);

  const onFormError = useCallback(() => {
    setNextPath(undefined);
  }, []);

  const onFormSave = useCallback(
    (payload: YupValidatedFormValues<T>): void => {
      onSave?.(payload, nextPath);
    },
    [onSave, nextPath]
  );

  const onNavigate = useCallback(
    (url: string): void => {
      if (isDirty) {
        setNextPath(url);
        return;
      }
      Router.push(url);
    },
    [isDirty]
  );

  useEffect(() => {
    return () => {
      setNextPath(undefined);
    };
  }, []);

  if (!formMethod) {
    return {
      access,
      isDirty: false,
      isDisabled: false,
      isLeaving: false,
      isSubmitted: false,
      isSubmitting: false,
    };
  }

  return {
    access,
    isDirty,
    isDisabled,
    isLeaving: Boolean(nextPath),
    isSubmitted,
    isSubmitting,
    onCancel,
    onDiscard: onFormDiscard,
    onNavigate,
    onSave: handleSubmit?.(onFormSave, onFormError),
  };
};
