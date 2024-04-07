import { useAsync } from "@clevercanary/data-explorer-ui/lib/hooks/useAsync";
import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback, useEffect } from "react";
import {
  AtlasId,
  HCAAtlasTrackerAtlas,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../common/entities";
import {
  getFetchOptions,
  getRequestURL,
  isFetchStatusOk,
} from "../common/utils";

const REQUEST_METHOD = METHOD.GET;
const REQUEST_URL = "/api/atlases/[id]";

export type Atlas = HCAAtlasTrackerAtlas | undefined;

interface UseFetchAtlas {
  atlas: Atlas;
  isLoading: boolean;
}

export const useFetchAtlas = (atlasId: AtlasId): UseFetchAtlas => {
  const { token } = useAuthentication();
  const { data: atlas, isIdle, isLoading, run } = useAsync<Atlas>();

  const fetchAtlas = useCallback(
    async (
      atlasId: AtlasId,
      accessToken: string
    ): Promise<HCAAtlasTrackerAtlas | undefined> => {
      const res = await fetch(
        getRequestURL(REQUEST_URL, atlasId),
        getFetchOptions(REQUEST_METHOD, accessToken)
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
    run(fetchAtlas(atlasId, token));
  }, [atlasId, fetchAtlas, run, token]);

  return { atlas, isLoading: isIdle || isLoading };
};
