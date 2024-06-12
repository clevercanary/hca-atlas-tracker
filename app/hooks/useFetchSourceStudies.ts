import { useAsync } from "@databiosphere/findable-ui/lib/hooks/useAsync";
import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback, useEffect } from "react";
import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceStudy } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../common/entities";
import {
  getFetchOptions,
  getRequestURL,
  isFetchStatusOk,
} from "../common/utils";

interface UseFetchSourceStudies {
  sourceStudies?: HCAAtlasTrackerSourceStudy[];
}

export const useFetchSourceStudies = (
  pathParameter: PathParameter
): UseFetchSourceStudies => {
  const { token } = useAuthentication();
  const { data: sourceStudies, run } = useAsync<
    HCAAtlasTrackerSourceStudy[] | undefined
  >();

  const fetchSourceStudies = useCallback(
    async (
      accessToken: string
    ): Promise<HCAAtlasTrackerSourceStudy[] | undefined> => {
      const res = await fetch(
        getRequestURL(API.ATLAS_SOURCE_STUDIES, pathParameter),
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
    run(fetchSourceStudies(token));
  }, [fetchSourceStudies, run, token]);

  return { sourceStudies };
};
