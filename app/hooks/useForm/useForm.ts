import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useState } from "react";
import { FieldValues, useForm as useReactHookForm } from "react-hook-form";
import { ObjectSchema } from "yup";
import { METHOD } from "../../common/entities";
import {
  isFetchStatusCreated,
  isFetchStatusNoContent,
  isFetchStatusOk,
} from "../../common/utils";
import {
  CustomUseFormReturn,
  OnDeleteFn,
  OnSubmitFn,
  OnSubmitOptions,
  YupValidatedFormValues,
} from "./common/entities";
import { fetchDelete, fetchSubmit, throwError } from "./common/utils";

export interface UseForm<T extends FieldValues> extends CustomUseFormReturn<T> {
  disabled: boolean;
  onDelete: OnDeleteFn;
  onSubmit: OnSubmitFn<T>;
}

export const useForm = <T extends FieldValues>(
  schema: ObjectSchema<T>,
  values?: T
): UseForm<T> => {
  const { token } = useAuthentication();
  const formMethod = useReactHookForm<YupValidatedFormValues<T>>({
    resolver: yupResolver(schema),
    values: schema.cast(values),
  });
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
  const { reset } = formMethod;

  const onDelete = useCallback(
    async (
      requestURL: string,
      requestMethod: METHOD,
      options?: OnSubmitOptions
    ): Promise<void> => {
      setSubmitDisabled(true);
      const res = await fetchDelete(requestURL, requestMethod, token);
      if (isFetchStatusNoContent(res.status)) {
        const { id } = await res.json();
        options?.onSuccess?.(id);
      } else {
        await throwError(res); // TODO more useful error handling
      }
      setSubmitDisabled(false);
    },
    [token]
  );

  const onSubmit = useCallback(
    async (
      requestURL: string,
      requestMethod: METHOD,
      payload: YupValidatedFormValues<T>,
      options?: OnSubmitOptions
    ): Promise<void> => {
      setSubmitDisabled(true);
      const res = await fetchSubmit(requestURL, requestMethod, token, payload);
      if (isFetchStatusCreated(res.status) || isFetchStatusOk(res.status)) {
        reset(payload);
        const { id } = await res.json();
        options?.onSuccess?.(id);
      } else {
        await throwError(res); // TODO more useful error handling
      }
      setSubmitDisabled(false);
    },
    [reset, token]
  );

  return {
    control: formMethod.control,
    disabled: submitDisabled,
    formState: formMethod.formState,
    getValues: formMethod.getValues,
    handleSubmit: formMethod.handleSubmit,
    onDelete,
    onSubmit,
  };
};
