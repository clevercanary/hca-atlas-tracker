import { METHOD } from "@/app/common/entities";
import { toError } from "@/app/common/requests";
import {
  fetchResource,
  getResponseErrorMessage,
  isFetchStatusCreated,
} from "@/app/common/utils";
import { useCallback, useState } from "react";
import { type OnSubmitOptions, type UseCreateAtlasRevision } from "./entities";

export const useCreateAtlasRevision = (): UseCreateAtlasRevision => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState<Error>();

  if (error !== undefined) throw error;

  const onSubmit = useCallback(
    async (requestURL: string, options?: OnSubmitOptions): Promise<void> => {
      try {
        setSucceeded(false);
        setIsRequesting(true);
        const res = await fetchResource(requestURL, METHOD.POST);
        setIsRequesting(false);
        if (isFetchStatusCreated(res.status)) {
          setSucceeded(true);
          const atlas = await res.json();
          options?.onSuccess?.(atlas);
        } else {
          setError(new Error(await getResponseErrorMessage(res)));
        }
      } catch (e) {
        setIsRequesting(false);
        setError(toError(e));
      }
    },
    [],
  );

  return { isRequesting, onSubmit, succeeded };
};
