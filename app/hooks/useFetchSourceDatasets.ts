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

interface UseFetchSourceDatasets {
  sourceDatasets?: HCAAtlasTrackerSourceStudy[];
}

export const useFetchSourceDatasets = (
  atlasId: AtlasId
): UseFetchSourceDatasets => {
  const { token } = useAuthentication();
  const { data: sourceDatasets, run } = useAsync<
    HCAAtlasTrackerSourceStudy[] | undefined
  >();

  const fetchSourceDatasets = useCallback(
    async (
      atlasId: AtlasId,
      accessToken: string
    ): Promise<HCAAtlasTrackerSourceStudy[] | undefined> => {
      const res = await fetch(
        getRequestURL(API.ATLAS_SOURCE_DATASETS, atlasId),
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
    run(fetchSourceDatasets(atlasId, token));
  }, [atlasId, fetchSourceDatasets, run, token]);

  return { sourceDatasets };
};
