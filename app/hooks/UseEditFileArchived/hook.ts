import { METHOD } from "@/app/common/entities";
import {
  fetchResource,
  getResponseErrorMessage,
  isFetchStatusOk,
} from "@/app/common/utils";
import { useCallback } from "react";
import {
  type OnSubmitOptions,
  type Payload,
  type UseEditFileArchived,
} from "./entities";

export const useEditFileArchived = (): UseEditFileArchived => {
  const onSubmit = useCallback(
    async (
      requestURL: string,
      payload: Payload,
      options?: OnSubmitOptions,
    ): Promise<void> => {
      const res = await fetchResource(requestURL, METHOD.PATCH, payload);
      if (isFetchStatusOk(res.status)) {
        options?.onSuccess?.();
      } else {
        throw new Error(await getResponseErrorMessage(res));
      }
    },
    [],
  );

  return { onSubmit };
};
