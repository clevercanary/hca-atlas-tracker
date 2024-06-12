import { useAsync } from "@databiosphere/findable-ui/lib/hooks/useAsync";
import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback, useEffect } from "react";
import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerAtlas } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../common/entities";
import {
  getFetchOptions,
  getRequestURL,
  isFetchStatusOk,
} from "../common/utils";

interface UseFetchAtlas {
  atlas?: HCAAtlasTrackerAtlas;
}

export const useFetchAtlas = (pathParameter: PathParameter): UseFetchAtlas => {
  const { token } = useAuthentication();
  const { data: atlas, run } = useAsync<HCAAtlasTrackerAtlas | undefined>();

  const fetchAtlas = useCallback(
    async (accessToken: string): Promise<HCAAtlasTrackerAtlas | undefined> => {
      const res = await fetch(
        getRequestURL(API.ATLAS, pathParameter),
        getFetchOptions(METHOD.GET, accessToken)
      );
      if (isFetchStatusOk(res.status)) {
        return await res.json();
      }
      throw new Error(
        await res
          .json()
          .then(({ message }) => message)
          .catch(() => `Received ${res.status} response`)
      );
    },
    [pathParameter]
  );

  useEffect(() => {
    if (!token) return;
    run(fetchAtlas(token));
  }, [fetchAtlas, run, token]);

  return { atlas };
};
