import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback, useEffect, useState } from "react";
import { API } from "../../../../../apis/catalog/hca-atlas-tracker/common/api";
import {
  HCAAtlasTrackerSourceDataset,
  HCAAtlasTrackerSourceStudy,
  SourceStudyId,
} from "../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../../../common/entities";
import { getFetchOptions, getRequestURL } from "../../../../../common/utils";
import { useFetchData } from "../../../../../hooks/useFetchData";

export const useFetchSourceStudiesSourceDatasets = (
  pathParameter: PathParameter
): HCAAtlasTrackerSourceDataset[] | undefined => {
  const { token } = useAuthentication();
  const [sourceStudiesSourceDatasets, setSourceStudiesSourceDatasets] =
    useState<HCAAtlasTrackerSourceDataset[]>();
  const { data: sourceStudies } = useFetchData<
    HCAAtlasTrackerSourceStudy[] | undefined
  >(getRequestURL(API.ATLAS_SOURCE_STUDIES, pathParameter), METHOD.GET);

  const fetchData = useCallback(
    async (
      sourceStudyIds: SourceStudyId[],
      pathParameter: PathParameter,
      token: string
    ): Promise<void> => {
      try {
        const requests = sourceStudyIds.map((sourceStudyId) =>
          fetch(
            getRequestURL(API.ATLAS_SOURCE_DATASETS, {
              ...pathParameter,
              sourceStudyId,
            }),
            getFetchOptions(METHOD.GET, token)
          ).then((response) => response.json())
        );
        const responses = await Promise.all(requests);
        setSourceStudiesSourceDatasets(responses.flatMap((r) => r));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    []
  );

  useEffect(() => {
    if (!token) return;
    if (!sourceStudies) return;
    fetchData(
      sourceStudies.map(({ id }) => id),
      pathParameter,
      token
    );
  }, [fetchData, pathParameter, sourceStudies, token]);

  return sourceStudiesSourceDatasets;
};
