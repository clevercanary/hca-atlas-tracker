import { useAsync } from "@databiosphere/findable-ui/lib/hooks/useAsync";
import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback, useEffect } from "react";
import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
import {
  AtlasId,
  HCAAtlasTrackerSourceStudy,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../common/entities";
import {
  getFetchOptions,
  getRequestURL,
  isFetchStatusOk,
} from "../common/utils";

interface UseFetchSourceStudies {
  sourceStudies?: HCAAtlasTrackerSourceStudy[];
}

export const useFetchSourceStudies = (
  atlasId: AtlasId
): UseFetchSourceStudies => {
  const { token } = useAuthentication();
  const { data: sourceStudies, run } = useAsync<
    HCAAtlasTrackerSourceStudy[] | undefined
  >();

  const fetchSourceStudies = useCallback(
    async (
      atlasId: AtlasId,
      accessToken: string
    ): Promise<HCAAtlasTrackerSourceStudy[] | undefined> => {
      const res = await fetch(
        getRequestURL(API.ATLAS_SOURCE_STUDIES, atlasId),
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
    run(fetchSourceStudies(atlasId, token));
  }, [atlasId, fetchSourceStudies, run, token]);

  return { sourceStudies };
};
