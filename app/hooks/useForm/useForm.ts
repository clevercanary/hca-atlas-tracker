import { type METHOD } from "@/app/common/entities";
import {
  fetchResource,
  isFetchStatusCreated,
  isFetchStatusOk,
} from "@/app/common/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useMemo } from "react";
import {
  type FieldValues,
  type Path,
  useForm as useReactHookForm,
} from "react-hook-form";
import { type ObjectSchema } from "yup";
import {
  type CustomUseFormOptions,
  type CustomUseFormReturn,
  type FormResponseErrors,
  type MapApiValuesFn,
  type MapSchemaValuesFn,
  type OnDeleteFn,
  type OnDeleteOptions,
  type OnSubmitFn,
  type OnSubmitOptions,
  type YupValidatedFormValues,
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
        // Read the body as text first so an intentionally empty success body
        // (e.g. 204/no content) is distinguishable from a non-empty but
        // malformed one: only the latter is an error. Then call onSuccess/
        // onReset OUTSIDE any try, so an exception they throw (e.g. Router.push)
        // isn't caught and re-run as a second onSuccess(undefined) — a
        // double-call that in the setQueryData managers would overwrite the
        // cache with undefined.
        const body = await res.text();
        // An empty body is a valid success: some bulk-edit endpoints respond
        // 2xx with no content and rely on onSuccess firing with undefined.
        let response: R = undefined as R;
        if (body) {
          try {
            response = JSON.parse(body);
          } catch {
            // Non-empty but unparseable body on a success status — surface it as
            // an error rather than proceeding as a successful (empty) save.
            onError({ message: "Received an unparseable response body." });
            return;
          }
        }
        options?.onSuccess?.(response);
        options?.onReset?.(schema.cast(mapSchemaValues?.(response)));
      } else {
        onError(await getFormResponseErrors(res));
      }
    },
    [mapApiValues, mapSchemaValues, onError, schema],
  );

  return {
    ...formMethod,
    // The entity the view renders comes straight from React Query (apiData).
    // Edit saves write the response back to the cache in each form-manager's
    // onSuccess (setQueryData, or invalidateQueries where the save response
    // shape differs from the detail query), so apiData reflects the save
    // without a local mirror.
    data: apiData,
    onDelete,
    onSubmit,
  };
};
