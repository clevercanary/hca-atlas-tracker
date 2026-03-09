import { useCallback, useState } from "react";
import { METHOD } from "../../common/entities";
import { fetchResource, isFetchStatusOk } from "../../common/utils";
import { OnSubmitOptions, UsePublishAtlas } from "./entities";

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
        setError(
          new Error(
            await res
              .json()
              .then(({ message }) => message)
              .catch(() => `Received ${res.status} response`),
          ),
        );
      }
    },
    [],
  );

  return { isRequesting, onSubmit };
};
