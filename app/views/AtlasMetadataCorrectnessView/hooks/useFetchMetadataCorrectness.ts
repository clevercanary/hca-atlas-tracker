import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { Heatmap } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchData } from "@/app/hooks/useFetchData";

interface UseFetchMetadataCorrectness {
  heatmap?: Heatmap;
}

export const useFetchMetadataCorrectness = (
  pathParameter: PathParameter,
): UseFetchMetadataCorrectness => {
  // Validate atlasId - required for API request.
  if (!pathParameter.atlasId) throw new Error("Atlas ID is required");

  const { data: heatmap } = useFetchData<Heatmap | undefined>(
    getRequestURL(API.ATLAS_METADATA_CORRECTNESS, pathParameter),
    METHOD.GET,
  );

  return { heatmap };
};
