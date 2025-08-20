import { HCAAtlasTrackerComponentAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../common/entities";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { FIELD_NAME } from "../common/constants";
import { ComponentAtlasViewData } from "../common/entities";
import { componentAtlasViewSchema } from "../common/schema";
import { useFetchComponentAtlas } from "./useFetchComponentAtlas";

const SCHEMA = componentAtlasViewSchema;

export const useViewComponentAtlasForm = (
  pathParameter: PathParameter
): FormMethod<ComponentAtlasViewData, HCAAtlasTrackerComponentAtlas> => {
  const { componentAtlas } = useFetchComponentAtlas(pathParameter);
  return useForm<ComponentAtlasViewData, HCAAtlasTrackerComponentAtlas>(
    SCHEMA,
    componentAtlas,
    mapSchemaValues
  );
};

/**
 * Returns schema default values mapped from component atlas.
 * @param componentAtlas - Component atlas.
 * @returns schema default values.
 */
function mapSchemaValues(
  componentAtlas?: HCAAtlasTrackerComponentAtlas
): ComponentAtlasViewData | undefined {
  if (!componentAtlas) return;
  return {
    [FIELD_NAME.TITLE]: componentAtlas.title,
  };
}
