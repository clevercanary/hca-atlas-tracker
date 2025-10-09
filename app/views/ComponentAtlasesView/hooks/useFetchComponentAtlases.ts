import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL } from "../../../common/utils";
import { useArchivedState } from "../../../components/Entity/providers/archived/hook";
import { useFetchData } from "../../../hooks/useFetchData";

interface UseFetchComponentAtlases {
  componentAtlases?: HCAAtlasTrackerComponentAtlas[];
}

export const useFetchComponentAtlases = (
  pathParameter: PathParameter
): UseFetchComponentAtlases => {
  const { archivedState } = useArchivedState();
  const { archived } = archivedState;

  const { data: componentAtlases } = useFetchData<
    HCAAtlasTrackerComponentAtlas[] | undefined
  >(
    `${getRequestURL(
      API.ATLAS_COMPONENT_ATLASES,
      pathParameter
    )}?archived=${archived}`,
    METHOD.GET
  );

  return { componentAtlases };
};
