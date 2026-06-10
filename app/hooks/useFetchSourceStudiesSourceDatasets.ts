import { useCallback, useEffect, useState } from "react";
import { API } from "../apis/catalog/hca-atlas-tracker/common/api";
import {
  HCAAtlasTrackerLocalListSourceDataset,
  HCAAtlasTrackerSourceStudy,
  SourceStudyId,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../common/entities";
import { getFetchOptions, getRequestURL } from "../common/utils";
import { useFetchData } from "./useFetchData";

export const useFetchSourceStudiesSourceDatasets = (
  pathParameter: PathParameter,
): HCAAtlasTrackerLocalListSourceDataset[] | undefined => {
  const [sourceStudiesSourceDatasets, setSourceStudiesSourceDatasets] =
    useState<HCAAtlasTrackerLocalListSourceDataset[]>();
  const { data: sourceStudies } = useFetchData<
    HCAAtlasTrackerSourceStudy[] | undefined
  >(getRequestURL(API.ATLAS_SOURCE_STUDIES, pathParameter), METHOD.GET);

  const fetchData = useCallback(
    async (
      sourceStudyIds: SourceStudyId[],
      pathParameter: PathParameter,
    ): Promise<void> => {
      try {
        const requests = sourceStudyIds.map((sourceStudyId) =>
          fetch(
            getRequestURL(API.ATLAS_SOURCE_STUDY_SOURCE_DATASETS, {
              ...pathParameter,
              sourceStudyId,
            }),
            getFetchOptions(METHOD.GET),
          ).then((response) => response.json()),
        );
        const responses = await Promise.all(requests);
        setSourceStudiesSourceDatasets(responses.flatMap((r) => r));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    [],
  );

  useEffect(() => {
    if (!sourceStudies) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- track via #1375
    fetchData(
      sourceStudies.map(({ id }) => id),
      pathParameter,
    );
  }, [fetchData, pathParameter, sourceStudies]);

  return sourceStudiesSourceDatasets;
};
