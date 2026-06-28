import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useMemo, useState } from "react";
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
  const [data, setData] = useState<R | undefined>(apiData);
  const [prevApiData, setPrevApiData] = useState(apiData);
  const { reset, setError } = formMethod;

  // Re-initialize data when the API response (apiData) changes — mirrors the
  // previous effect keyed on [apiData]: track every reference change, but only
  // overwrite data when apiData is truthy. apiData must be referentially stable
  // across renders (it is — it comes from useFetchData's state); a caller
  // passing a freshly-built apiData each render would loop ("Too many
  // re-renders"), just as the prior effect would have looped on [apiData].
  if (prevApiData !== apiData) {
    setPrevApiData(apiData);
    if (apiData) setData(apiData);
  }

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

  return {
    ...formMethod,
    data,
    onDelete,
    onSubmit,
  };
};
