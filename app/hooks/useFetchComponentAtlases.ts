import { useAsync } from "@databiosphere/findable-ui/lib/hooks/useAsync";
import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback, useEffect } from "react";
import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
import {
  AtlasId,
  HCAAtlasTrackerComponentAtlas,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../common/entities";
import {
  getFetchOptions,
  getRequestURL,
  isFetchStatusOk,
} from "../common/utils";

interface UseFetchComponentAtlases {
  componentAtlases?: HCAAtlasTrackerComponentAtlas[];
}

export const useFetchComponentAtlases = (
  atlasId: AtlasId
): UseFetchComponentAtlases => {
  const { token } = useAuthentication();
  const { data: componentAtlases, run } = useAsync<
    HCAAtlasTrackerComponentAtlas[] | undefined
  >();

  const fetchComponentAtlases = useCallback(
    async (
      atlasId: AtlasId,
      accessToken: string
    ): Promise<HCAAtlasTrackerComponentAtlas[] | undefined> => {
      const res = await fetch(
        getRequestURL(API.ATLAS_COMPONENT_ATLASES, atlasId),
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
    []
  );

  useEffect(() => {
    if (!token) return;
    run(fetchComponentAtlases(atlasId, token));
  }, [atlasId, fetchComponentAtlases, run, token]);

  return { componentAtlases };
};
