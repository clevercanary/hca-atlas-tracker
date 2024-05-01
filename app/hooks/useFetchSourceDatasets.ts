import { useAsync } from "@databiosphere/findable-ui/lib/hooks/useAsync";
import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback, useEffect } from "react";
import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
import {
  AtlasId,
  HCAAtlasTrackerSourceDataset,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../common/entities";
import {
  getFetchOptions,
  getRequestURL,
  isFetchStatusOk,
} from "../common/utils";

interface UseFetchSourceDatasets {
  isAuthenticated: boolean;
  sourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const useFetchSourceDatasets = (
  atlasId: AtlasId
): UseFetchSourceDatasets => {
  const { isAuthenticated, token } = useAuthentication();
  const { data: sourceDatasets, run } = useAsync<
    HCAAtlasTrackerSourceDataset[] | undefined
  >();

  const fetchSourceDatasets = useCallback(
    async (
      atlasId: AtlasId,
      accessToken: string
    ): Promise<HCAAtlasTrackerSourceDataset[] | undefined> => {
      const res = await fetch(
        getRequestURL(API.ATLAS_SOURCE_DATASETS, atlasId),
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
    run(fetchSourceDatasets(atlasId, token));
  }, [atlasId, fetchSourceDatasets, run, token]);

  return { isAuthenticated, sourceDatasets };
};
