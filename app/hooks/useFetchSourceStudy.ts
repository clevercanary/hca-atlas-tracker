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

interface UseFetchSourceStudy {
  sourceStudy?: HCAAtlasTrackerSourceStudy;
}

export const useFetchSourceStudy = (
  atlasId: AtlasId,
  sourceStudyId: string
): UseFetchSourceStudy => {
  const { token } = useAuthentication();
  const { data: sourceStudy, run } = useAsync<
    HCAAtlasTrackerSourceStudy | undefined
  >();

  const fetchSourceStudy = useCallback(
    async (
      atlasId: AtlasId,
      sourceStudyId: string,
      accessToken: string
    ): Promise<HCAAtlasTrackerSourceStudy | undefined> => {
      const res = await fetch(
        getRequestURL(API.ATLAS_SOURCE_STUDY, atlasId, sourceStudyId),
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
    run(fetchSourceStudy(atlasId, sourceStudyId, token));
  }, [atlasId, fetchSourceStudy, run, sourceStudyId, token]);

  return {
    sourceStudy,
  };
};
