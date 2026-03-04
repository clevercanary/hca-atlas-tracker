import { useCallback, useState } from "react";
import { METHOD } from "../../common/entities";
import { fetchResource, isFetchStatusOk } from "../../common/utils";
import { OnSubmitOptions, UsePublishAtlas } from "./entities";

export const usePublishAtlas = (): UsePublishAtlas => {
  const [error, setError] = useState<Error>();

  if (error !== undefined) throw error;

  const onSubmit = useCallback(
    async (requestURL: string, options?: OnSubmitOptions): Promise<void> => {
      const res = await fetchResource(requestURL, METHOD.POST);
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

  return { onSubmit };
};
