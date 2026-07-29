import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { AtlasStatusSummary } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchData } from "@/app/hooks/useFetchData";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { useResetFetchStatus } from "@/app/hooks/useResetFetchStatus";

export const ATLAS_STATUS = "atlasStatus";

interface UseFetchAtlasStatus {
  atlasStatus?: AtlasStatusSummary;
}

export const useFetchAtlasStatus = (
  pathParameter: PathParameter,
): UseFetchAtlasStatus => {
  const {
    fetchDataState: { shouldFetchByKey },
  } = useFetchDataState();
  const shouldFetch = shouldFetchByKey[ATLAS_STATUS];

  // Validate atlasId - required for API request.
  if (!pathParameter.atlasId) throw new Error("Atlas ID is required");

  const { data: atlasStatus, progress } = useFetchData<
    AtlasStatusSummary | undefined
  >(getRequestURL(API.ATLAS_STATUS, pathParameter), METHOD.GET, shouldFetch);

  useResetFetchStatus(progress, [ATLAS_STATUS]);

  return { atlasStatus };
};
