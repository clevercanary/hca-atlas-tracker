import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useState } from "react";
import {
  FieldValues,
  useForm as useReactHookForm,
  UseFormReturn,
} from "react-hook-form";
import { InferType, ObjectSchema } from "yup";
import { METHOD } from "../../common/entities";
import { getHeaders } from "./common/utils";

interface UseForm<T extends FieldValues>
  extends Pick<
    UseFormReturn<InferType<ObjectSchema<T>>>,
    "control" | "formState"
  > {
  disabled: boolean;
  onSubmit: () => Promise<void>;
}

export const useForm = <T extends FieldValues>(
  schema: ObjectSchema<T>,
  requestURL: string,
  requestMethod: METHOD,
  onSuccess?: (id: string) => void
): UseForm<T> => {
  const { token } = useAuthentication();
  const formMethods = useReactHookForm<InferType<ObjectSchema<T>>>({
    resolver: yupResolver(schema),
  });
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);

  const onSubmit = useCallback(
    async (data: InferType<ObjectSchema<T>>): Promise<void> => {
      setSubmitDisabled(true);
      const res = await fetch(requestURL, {
        body: JSON.stringify(data),
        headers: getHeaders(token),
        method: requestMethod,
      });
      if (res.status !== 201) {
        setSubmitDisabled(false);
        // TODO more useful error handling
        throw new Error(
          await res
            .json()
            .then(({ message }) => message)
            .catch(() => `Received ${res.status} response`)
        );
      }
      const { id } = await res.json();
      onSuccess?.(id);
    },
    [token, onSuccess, requestMethod, requestURL]
  );

  const handleFormSubmit = formMethods.handleSubmit(onSubmit);

  return {
    control: formMethods.control,
    disabled: submitDisabled,
    formState: formMethods.formState,
    onSubmit: handleFormSubmit,
  };
};
