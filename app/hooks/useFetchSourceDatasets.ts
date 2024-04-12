import { useAsync } from "@clevercanary/data-explorer-ui/lib/hooks/useAsync";
import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
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
  isLoading: boolean;
  sourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const useFetchSourceDatasets = (
  atlasId: AtlasId
): UseFetchSourceDatasets => {
  const { token } = useAuthentication();
  const {
    data: sourceDatasets,
    isIdle,
    isLoading,
    run,
  } = useAsync<HCAAtlasTrackerSourceDataset[] | undefined>();

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

  return { isLoading: isIdle || isLoading, sourceDatasets };
};