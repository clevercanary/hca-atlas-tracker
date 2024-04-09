import Router from "next/router";
import { useMemo } from "react";
import { HCAAtlasTrackerAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewAtlasData,
  newAtlasSchema,
} from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { getRouteURL } from "../../../common/utils";
import {
  FIELD_NAME_ATLAS_NAME,
  FIELD_NAME_BIO_NETWORK,
  FIELD_NAME_VERSION,
} from "../../../components/Detail/components/TrackerForm/components/Section/components/GeneralInfo/generalInfo";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { ROUTE } from "../../../routes/constants";

const SCHEMA = newAtlasSchema;

export const useEditAtlasForm = (
  atlas?: HCAAtlasTrackerAtlas
): FormMethod<NewAtlasData> => {
  const values = useMemo(() => mapSchemaValues(atlas), [atlas]);
  return useForm<NewAtlasData>(SCHEMA, values);
};

/**
 * Returns schema default values mapped from atlas.
 * @param atlas - Atlas.
 * @returns schema default values.
 */
function mapSchemaValues(atlas?: HCAAtlasTrackerAtlas): NewAtlasData {
  return {
    [FIELD_NAME_ATLAS_NAME]: atlas?.focus || "",
    [FIELD_NAME_BIO_NETWORK]: atlas?.bioNetwork || "",
    [FIELD_NAME_VERSION]: atlas?.version || "",
  };
}

/**
 * Side effect "onSuccess"; redirects to the atlas page.
 * @param id - Atlas ID.
 */
export function onSuccess(id: string): void {
  Router.push(getRouteURL(ROUTE.VIEW_ATLAS, id));
}

/**
 * Side effect "onSuccess"; redirects to atlases.
 */
export function onDeleteSuccess(): void {
  Router.push(ROUTE.ATLASES);
}
