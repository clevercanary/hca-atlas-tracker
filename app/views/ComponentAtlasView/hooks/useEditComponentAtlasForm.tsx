import {
  AtlasId,
  ComponentAtlasId,
  HCAAtlasTrackerComponentAtlas,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { useFetchComponentAtlas } from "../../../hooks/useFetchComponentAtlas";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { FIELD_NAME } from "../common/constants";
import { ComponentAtlasEditData } from "../common/entities";
import { componentAtlasEditSchema } from "../common/schema";

const SCHEMA = componentAtlasEditSchema;

export const useEditComponentAtlasForm = (
  atlasId: AtlasId,
  componentAtlasId: ComponentAtlasId
): FormMethod<ComponentAtlasEditData, HCAAtlasTrackerComponentAtlas> => {
  const { componentAtlas } = useFetchComponentAtlas(atlasId, componentAtlasId);
  return useForm<ComponentAtlasEditData, HCAAtlasTrackerComponentAtlas>(
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
): ComponentAtlasEditData | undefined {
  if (!componentAtlas) return;
  return {
    [FIELD_NAME.TITLE]: componentAtlas.title,
  };
}
