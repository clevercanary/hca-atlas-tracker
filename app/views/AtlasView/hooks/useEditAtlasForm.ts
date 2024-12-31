import {
  ATLAS_ECOSYSTEM_PATHS,
  ATLAS_ECOSYSTEM_URLS,
} from "../../../../site-config/common/constants";
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
function mapSchemaValues(atlas?: HCAAtlasTrackerAtlas): Partial<AtlasEditData> {
  if (!atlas)
    return {
      integrationLead: [
        {
          email: "",
          name: "",
        },
      ],
    };
  const sortedIntegrationLead = atlas.integrationLead.sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  return {
    [FIELD_NAME.INTEGRATION_LEAD]: sortedIntegrationLead,
    [FIELD_NAME.BIO_NETWORK]: atlas.bioNetwork,
    [FIELD_NAME.CELLXGENE_ATLAS_COLLECTION]: mapCELLxGENECollectionId(
      atlas.cellxgeneAtlasCollection
    ),
    [FIELD_NAME.DOI]: atlas.publications[0]?.doi,
    [FIELD_NAME.METADATA_SPECIFICATION_URL]:
      atlas.metadataSpecificationUrl ?? "",
    [FIELD_NAME.SHORT_NAME]: atlas.shortName,
    [FIELD_NAME.STATUS]: atlas.status,
    [FIELD_NAME.TARGET_COMPLETION]:
      atlas.targetCompletion ?? TARGET_COMPLETION_NULL,
    [FIELD_NAME.VERSION]: atlas.version,
    [FIELD_NAME.WAVE]: atlas.wave,
  };
}

/**
 * Maps CELLxGENE collection ID to URL.
 * @param cellxgeneCollectionId - CELLxGENE collection ID.
 * @returns URL.
 */
function mapCELLxGENECollectionId(
  cellxgeneCollectionId: string | null
): string {
  if (!cellxgeneCollectionId) return "";
  return `${ATLAS_ECOSYSTEM_URLS.CELLXGENE_PORTAL}${ATLAS_ECOSYSTEM_PATHS.CELLXGENE_COLLECTION}/${cellxgeneCollectionId}`;
}

/**
 * Returns API payload mapped from data.
 * @param data - Form data.
 * @param data.doi - DOI.
 * @returns API payload.
 */
function mapApiValues({ doi, ...data }: AtlasEditData): APIAtlasEditData {
  return {
    ...data,
    dois: doi ? [doi] : undefined,
    targetCompletion: mapTargetCompletion(data.targetCompletion),
  };
}
