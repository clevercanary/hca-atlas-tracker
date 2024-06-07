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

interface UseFetchComponentAtlas {
  componentAtlas?: HCAAtlasTrackerComponentAtlas;
}

export const useFetchComponentAtlas = (
  atlasId: AtlasId,
  componentAtlasId: string
): UseFetchComponentAtlas => {
  const { token } = useAuthentication();
  const { data: componentAtlas, run } = useAsync<
    HCAAtlasTrackerComponentAtlas | undefined
  >();

  const fetchComponentAtlas = useCallback(
    async (
      atlasId: AtlasId,
      componentAtlasId: string,
      accessToken: string
    ): Promise<HCAAtlasTrackerComponentAtlas | undefined> => {
      const res = await fetch(
        getRequestURL(API.ATLAS_COMPONENT_ATLAS, atlasId, componentAtlasId),
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
    run(fetchComponentAtlas(atlasId, componentAtlasId, token));
  }, [atlasId, componentAtlasId, fetchComponentAtlas, run, token]);

  return {
    componentAtlas,
  };
};
