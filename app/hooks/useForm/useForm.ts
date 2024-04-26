import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useState } from "react";
import {
  FieldValues,
  Path,
  useForm as useReactHookForm,
} from "react-hook-form";
import { ObjectSchema } from "yup";
import { METHOD } from "../../common/entities";
import {
  isFetchStatusCreated,
  isFetchStatusNoContent,
  isFetchStatusOk,
} from "../../common/utils";
import {
  CustomUseFormReturn,
  FormResponseErrors,
  MapSchemaValuesFn,
  OnDeleteFn,
  OnSubmitFn,
  OnSubmitOptions,
  YupValidatedFormValues,
} from "./common/entities";
import {
  fetchDelete,
  fetchSubmit,
  getFormResponseErrors,
} from "./common/utils";

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
    reValidateMode: "onSubmit",
    resolver: yupResolver(schema),
    values: schema.cast(mapSchemaValues?.(apiData)),
  });
  const [data, setData] = useState<R | undefined>();
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
  const { reset, setError } = formMethod;

  const onError = useCallback(
    (errors: FormResponseErrors) => {
      if ("message" in errors) throw new Error(errors.message); // TODO display these errors?
      for (const [field, messages] of Object.entries(errors.errors)) {
        setError(field as Path<YupValidatedFormValues<T>>, {
          message: messages[0],
          type: "manual",
        });
      }
    },
    [setError]
  );

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
        onError(await getFormResponseErrors(res));
      }
      setSubmitDisabled(false);
    },
    [token, onError]
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
        onError(await getFormResponseErrors(res));
      }
      setSubmitDisabled(false);
    },
    [reset, token, onError]
  );

  // Initialize data with given API response.
  useEffect(() => {
    if (!apiData) return;
    setData(apiData);
  }, [apiData]);

  return {
    ...formMethod,
    data,
    disabled: submitDisabled,
    onDelete,
    onSubmit,
  };
};
