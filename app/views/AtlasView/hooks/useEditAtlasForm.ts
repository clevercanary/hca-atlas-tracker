import { HCAAtlasTrackerAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasEditData as APIAtlasEditData } from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { PathParameter } from "../../../common/entities";
import { TARGET_COMPLETION_NULL } from "../../../components/Form/components/Select/components/TargetCompletion/common/constants";
import { mapTargetCompletion } from "../../../components/Form/components/Select/components/TargetCompletion/common/utils";
import { useFetchAtlas } from "../../../hooks/useFetchAtlas";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { FIELD_NAME } from "../common/constants";
import { AtlasEditData } from "../common/entities";
import { atlasEditSchema } from "../common/schema";

const SCHEMA = atlasEditSchema;

export const useEditAtlasForm = (
  pathParameter: PathParameter
): FormMethod<AtlasEditData, HCAAtlasTrackerAtlas> => {
  const { atlas } = useFetchAtlas(pathParameter);
  return useForm<AtlasEditData, HCAAtlasTrackerAtlas>(
    SCHEMA,
    atlas,
    mapSchemaValues,
    mapApiValues
  );
};

/**
 * Returns schema default values mapped from atlas.
 * @param atlas - Atlas.
 * @returns schema default values.
 */
function mapSchemaValues(
  atlas?: HCAAtlasTrackerAtlas
): AtlasEditData | undefined {
  if (!atlas) return;
  const sortedIntegrationLead = atlas.integrationLead.sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  return {
    [FIELD_NAME.INTEGRATION_LEAD_A]: sortedIntegrationLead[0],
    [FIELD_NAME.INTEGRATION_LEAD_B]: sortedIntegrationLead[1],
    [FIELD_NAME.BIO_NETWORK]: atlas.bioNetwork,
    [FIELD_NAME.SHORT_NAME]: atlas.shortName,
    [FIELD_NAME.TARGET_COMPLETION]:
      atlas.targetCompletion ?? TARGET_COMPLETION_NULL,
    [FIELD_NAME.VERSION]: atlas.version,
    [FIELD_NAME.WAVE]: atlas.wave,
  };
}

/**
 * Returns API payload mapped from data.
 * @param data - Form data.
 * @returns API payload.
 */
function mapApiValues(data: AtlasEditData): APIAtlasEditData {
  const integrationLead = [data.integrationLeadA];
  if (data.integrationLeadB.name) integrationLead.push(data.integrationLeadB);
  return {
    ...data,
    integrationLead,
    targetCompletion: mapTargetCompletion(data.targetCompletion),
  };
}
