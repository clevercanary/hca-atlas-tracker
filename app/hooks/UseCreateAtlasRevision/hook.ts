import { useCallback, useState } from "react";
import { METHOD } from "../../common/entities";
import { fetchResource, isFetchStatusCreated } from "../../common/utils";
import { OnSubmitOptions, UseCreateAtlasRevision } from "./entities";

export const useCreateAtlasRevision = (): UseCreateAtlasRevision => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState<Error>();

  if (error !== undefined) throw error;

  const onSubmit = useCallback(
    async (requestURL: string, options?: OnSubmitOptions): Promise<void> => {
      setSucceeded(false);
      setIsRequesting(true);
      const res = await fetchResource(requestURL, METHOD.POST);
      setIsRequesting(false);
      if (isFetchStatusCreated(res.status)) {
        setSucceeded(true);
        const atlas = await res.json();
        options?.onSuccess?.(atlas);
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

  return { isRequesting, onSubmit, succeeded };
};
