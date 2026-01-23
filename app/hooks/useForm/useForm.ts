import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FieldValues,
  Path,
  useForm as useReactHookForm,
} from "react-hook-form";
import { ObjectSchema } from "yup";
import { METHOD } from "../../common/entities";
import {
  fetchResource,
  isFetchStatusCreated,
  isFetchStatusOk,
} from "../../common/utils";
import {
  CustomUseFormOptions,
  CustomUseFormReturn,
  FormResponseErrors,
  MapApiValuesFn,
  MapSchemaValuesFn,
  OnDeleteFn,
  OnDeleteOptions,
  OnSubmitFn,
  OnSubmitOptions,
  YupValidatedFormValues,
} from "./common/entities";
import { getFormResponseErrors } from "./common/utils";

export interface UseForm<
  T extends FieldValues,
  R = undefined,
> extends CustomUseFormReturn<T> {
  data?: R;
  onDelete: OnDeleteFn;
  onSubmit: OnSubmitFn<T, R>;
}

export const useForm = <T extends FieldValues, R = undefined>(
  schema: ObjectSchema<T>,
  apiData?: R,
  mapSchemaValues?: MapSchemaValuesFn<T, R>,
  mapApiValues: MapApiValuesFn<T> = (p): unknown => p,
  options: CustomUseFormOptions<T> = {},
): UseForm<T, R> => {
  const values = useMemo(
    () => schema.cast(mapSchemaValues?.(apiData)),
    [apiData, mapSchemaValues, schema],
  );
  const formMethod = useReactHookForm<YupValidatedFormValues<T>>({
    reValidateMode: "onSubmit",
    resolver: yupResolver(schema),
    values,
    ...options,
  });
  const [data, setData] = useState<R | undefined>();
  const { reset, setError } = formMethod;

  const onError = useCallback(
    (errors: FormResponseErrors) => {
      if ("message" in errors) throw new Error(errors.message); // TODO display these errors?
      for (const [field, messages] of Object.entries(errors.errors)) {
        setError(field as Path<YupValidatedFormValues<T>>, {
          message: messages[0],
          type: "manual",
        });
        reset(undefined, {
          keepDirty: true,
          keepErrors: true,
          keepValues: true,
        });
      }
    },
    [reset, setError],
  );

  const onDelete = useCallback(
    async (
      requestURL: string,
      requestMethod: METHOD,
      options?: OnDeleteOptions,
    ): Promise<void> => {
      const res = await fetchResource(requestURL, requestMethod);
      if (isFetchStatusOk(res.status)) {
        options?.onSuccess?.();
      } else {
        onError(await getFormResponseErrors(res));
      }
    },
    [onError],
  );

  const onSubmit = useCallback(
    async (
      requestURL: string,
      requestMethod: METHOD,
      payload: YupValidatedFormValues<T>,
      options?: OnSubmitOptions<T, R>,
    ): Promise<void> => {
      const apiPayload = mapApiValues ? mapApiValues(payload) : payload;
      const res = await fetchResource(requestURL, requestMethod, apiPayload);
      if (isFetchStatusCreated(res.status) || isFetchStatusOk(res.status)) {
        try {
          const response = await res.json();
          setData(response);
          options?.onSuccess?.(response);
          options?.onReset?.(schema.cast(mapSchemaValues?.(response)));
        } catch {
          options?.onSuccess?.(undefined as R);
        }
      } else {
        onError(await getFormResponseErrors(res));
      }
    },
    [mapApiValues, mapSchemaValues, onError, schema],
  );

  // Initialize data with given API response.
  useEffect(() => {
    if (!apiData) return;
    setData(apiData);
  }, [apiData]);

  return {
    ...formMethod,
    data,
    onDelete,
    onSubmit,
  };
};
