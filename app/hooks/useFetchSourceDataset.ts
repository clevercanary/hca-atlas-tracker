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

interface UseFetchSourceDataset {
  sourceDataset?: HCAAtlasTrackerSourceDataset;
}

export const useFetchSourceDataset = (
  atlasId: AtlasId,
  sdId: string
): UseFetchSourceDataset => {
  const { token } = useAuthentication();
  const { data: sourceDataset, run } = useAsync<
    HCAAtlasTrackerSourceDataset | undefined
  >();

  const fetchSourceDataset = useCallback(
    async (
      atlasId: AtlasId,
      sdId: string,
      accessToken: string
    ): Promise<HCAAtlasTrackerSourceDataset | undefined> => {
      const res = await fetch(
        getRequestURL(API.ATLAS_SOURCE_DATASET, atlasId, sdId),
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
    run(fetchSourceDataset(atlasId, sdId, token));
  }, [atlasId, fetchSourceDataset, run, sdId, token]);

  return {
    sourceDataset,
  };
};
