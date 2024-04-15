import Router from "next/router";
import { useMemo } from "react";
import { HCAAtlasTrackerAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  AtlasEditData,
  atlasEditSchema,
} from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { getRouteURL } from "../../../common/utils";
import {
  FIELD_NAME_ATLAS_NAME,
  FIELD_NAME_BIO_NETWORK,
  FIELD_NAME_VERSION,
  FIELD_NAME_WAVE,
} from "../../../components/Detail/components/TrackerForm/components/Section/components/Atlas/components/GeneralInfo/generalInfo";
import { FIELD_NAME_INTEGRATION_LEAD } from "../../../components/Detail/components/TrackerForm/components/Section/components/Atlas/components/IntegrationLead/integrationLead";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { ROUTE } from "../../../routes/constants";

const SCHEMA = atlasEditSchema;

export const useEditAtlasForm = (
  atlas?: HCAAtlasTrackerAtlas
): FormMethod<AtlasEditData> => {
  const values = useMemo(() => mapSchemaValues(atlas), [atlas]);
  return useForm<AtlasEditData>(SCHEMA, values);
};

/**
 * Returns schema default values mapped from atlas.
 * @param atlas - Atlas.
 * @returns schema default values.
 */
function mapSchemaValues(
  atlas?: HCAAtlasTrackerAtlas
): AtlasEditData | undefined {
  return (
    atlas && {
      [FIELD_NAME_ATLAS_NAME]: atlas.shortName,
      [FIELD_NAME_BIO_NETWORK]: atlas.bioNetwork,
      [FIELD_NAME_INTEGRATION_LEAD]: atlas.integrationLead,
      [FIELD_NAME_VERSION]: atlas.version,
      [FIELD_NAME_WAVE]: atlas.wave,
    }
  );
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
