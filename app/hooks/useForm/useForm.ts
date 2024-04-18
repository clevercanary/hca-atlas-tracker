import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useState } from "react";
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
  MapSchemaValuesFn,
  OnDeleteFn,
  OnSubmitFn,
  OnSubmitOptions,
  YupValidatedFormValues,
} from "./common/entities";
import { fetchDelete, fetchSubmit, throwError } from "./common/utils";

export interface UseForm<T extends FieldValues, R = undefined>
  extends CustomUseFormReturn<T> {
  data?: R;
  disabled: boolean;
  onDelete: OnDeleteFn;
  onSubmit: OnSubmitFn<T>;
}

export const useForm = <T extends FieldValues, R = undefined>(
  schema: ObjectSchema<T>,
  apiData?: R,
  mapSchemaValues?: MapSchemaValuesFn<T, R>
): UseForm<T, R> => {
  const { token } = useAuthentication();
  const formMethod = useReactHookForm<YupValidatedFormValues<T>>({
    resolver: yupResolver(schema),
    values: schema.cast(mapSchemaValues?.(apiData)),
  });
  const [data, setData] = useState<R | undefined>();
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
        const { id, ...other } = await res.json();
        setData({ id, ...other });
        options?.onSuccess?.(id);
      } else {
        await throwError(res); // TODO more useful error handling
      }
      setSubmitDisabled(false);
    },
    [reset, token]
  );

  // Initialize data with given API response.
  useEffect(() => {
    if (!apiData) return;
    setData(apiData);
  }, [apiData]);

  return {
    control: formMethod.control,
    data,
    disabled: submitDisabled,
    formState: formMethod.formState,
    handleSubmit: formMethod.handleSubmit,
    onDelete,
    onSubmit,
  };
};
