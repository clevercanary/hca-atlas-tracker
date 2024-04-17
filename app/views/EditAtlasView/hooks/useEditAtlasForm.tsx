import Router from "next/router";
import {
  AtlasId,
  HCAAtlasTrackerAtlas,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  AtlasEditData,
  atlasEditSchema,
} from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { getRouteURL } from "../../../common/utils";
import { FIELD_NAME } from "../../../components/Detail/components/TrackerForm/components/Section/components/Atlas/common/constants";
import { useFetchAtlas } from "../../../hooks/useFetchAtlas";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { ROUTE } from "../../../routes/constants";

const SCHEMA = atlasEditSchema;

export const useEditAtlasForm = (
  atlasId: AtlasId
): FormMethod<AtlasEditData, HCAAtlasTrackerAtlas> => {
  const { atlas } = useFetchAtlas(atlasId);
  return useForm<AtlasEditData, HCAAtlasTrackerAtlas>(
    SCHEMA,
    atlas,
    mapSchemaValues
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
  return {
    [FIELD_NAME.SHORT_NAME]: atlas.shortName,
    [FIELD_NAME.BIO_NETWORK]: atlas.bioNetwork,
    [FIELD_NAME.INTEGRATION_LEAD]: atlas.integrationLead,
    [FIELD_NAME.VERSION]: atlas.version,
    [FIELD_NAME.WAVE]: atlas.wave,
  };
}

/**
 * Side effect "onSuccess"; redirects to the atlas page.
 * @param id - Atlas ID.
 */
export function onSuccess(id: string): void {
  Router.push(getRouteURL(ROUTE.EDIT_ATLAS, id));
}

/**
 * Side effect "onSuccess"; redirects to atlases.
 */
export function onDeleteSuccess(): void {
  Router.push(ROUTE.ATLASES);
}
