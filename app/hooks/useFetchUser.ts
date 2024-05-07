import { useAsync } from "@databiosphere/findable-ui/lib/hooks/useAsync";
import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback, useEffect } from "react";
import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerActiveUser } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../common/entities";
import { getFetchOptions, isFetchStatusOk } from "../common/utils";

export const useFetchUser = (): HCAAtlasTrackerActiveUser | undefined => {
  const { token } = useAuthentication();
  const { data: user, run } = useAsync<HCAAtlasTrackerActiveUser | undefined>();

  const fetchUser = useCallback(
    async (
      accessToken: string
    ): Promise<HCAAtlasTrackerActiveUser | undefined> => {
      const res = await fetch(
        API.USER,
        getFetchOptions(METHOD.GET, accessToken)
      );
      if (isFetchStatusOk(res.status)) {
        return await res.json();
      }
      // TODO handle error.
      throw new Error(
        await res
          .json()
          .then(({ message }) => message)
          .catch(() => `Received ${res.status} response`)
      );
    },
    []
  );

  useEffect(() => {
    if (!token) return;
    run(fetchUser(token));
  }, [fetchUser, run, token]);

  return user;
};
