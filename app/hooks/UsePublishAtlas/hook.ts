import { METHOD } from "@/app/common/entities";
import {
  fetchResource,
  getResponseErrorMessage,
  isFetchStatusOk,
} from "@/app/common/utils";
import { useCallback, useState } from "react";
import { type OnSubmitOptions, type UsePublishAtlas } from "./entities";

export const usePublishAtlas = (): UsePublishAtlas => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<Error>();

  if (error !== undefined) throw error;

  const onSubmit = useCallback(
    async (requestURL: string, options?: OnSubmitOptions): Promise<void> => {
      setIsRequesting(true);
      const res = await fetchResource(requestURL, METHOD.POST);
      setIsRequesting(false);
      if (isFetchStatusOk(res.status)) {
        options?.onSuccess?.();
      } else {
        setError(new Error(await getResponseErrorMessage(res)));
      }
    },
    [],
  );

  return { isRequesting, onSubmit };
};
