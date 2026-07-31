import { METHOD } from "@/app/common/entities";
import { fetchResource, isFetchStatusOk } from "@/app/common/utils";
import { useCallback } from "react";
import { OnDeleteOptions } from "./useForm/common/entities";

export interface UseDeleteData<T> {
  onDelete: (payload?: T) => Promise<void>;
}

export const useDeleteData = <T>(
  requestUrl: string,
  method = METHOD.DELETE,
  options?: OnDeleteOptions,
): UseDeleteData<T> => {
  const onDelete = useCallback(
    async (payload?: T): Promise<void> => {
      const res = await fetchResource(requestUrl, method, payload);
      if (isFetchStatusOk(res.status)) {
        options?.onSuccess?.();
      } else {
        throw new Error(
          await res
            .json()
            .then(({ message }) => message)
            .catch(() => `Received ${res.status} response`),
        );
      }
    },
    [method, options, requestUrl],
  );

  return {
    onDelete,
  };
};
