import { useCredentials } from "@databiosphere/findable-ui/lib/providers/authentication/credentials/hook";
import { useCallback } from "react";
import { METHOD } from "../common/entities";
import { fetchResource, isFetchStatusOk } from "../common/utils";
import { OnDeleteOptions } from "./useForm/common/entities";

export interface UseDeleteData<T> {
  onDelete: (payload?: T) => Promise<void>;
}

export const useDeleteData = <T>(
  requestUrl: string,
  method = METHOD.DELETE,
  options?: OnDeleteOptions
): UseDeleteData<T> => {
  const {
    credentialsState: { credentials: token },
  } = useCredentials();

  const onDelete = useCallback(
    async (payload?: T): Promise<void> => {
      const res = await fetchResource(requestUrl, method, token, payload);
      if (isFetchStatusOk(res.status)) {
        options?.onSuccess?.();
      } else {
        throw new Error(
          await res
            .json()
            .then(({ message }) => message)
            .catch(() => `Received ${res.status} response`)
        );
      }
    },
    [method, options, requestUrl, token]
  );

  return {
    onDelete,
  };
};
