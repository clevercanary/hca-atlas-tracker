import Router from "next/router";
import { useMemo } from "react";
import { HCAAtlasTrackerAtlas } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewAtlasData,
  newAtlasSchema,
} from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../common/entities";
import {
  FIELD_NAME_ATLAS_NAME,
  FIELD_NAME_BIO_NETWORK,
  FIELD_NAME_VERSION,
} from "../../../components/Detail/components/TrackerForm/components/Section/components/GeneralInfo/generalInfo";
import { ROUTE } from "../../../constants/routes";
import { Atlas } from "../../../hooks/useFetchAtlas";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";

export const REQUEST_METHOD = METHOD.PUT;
export const REQUEST_URL = "/api/atlases/[id]";
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
function mapSchemaValues(atlas?: Atlas): NewAtlasData {
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
  Router.push(`${ROUTE.ATLASES}/${id}`);
}

/**
 * Side effect "onSuccess"; redirects to atlases.
 */
export function onDeleteSuccess(): void {
  Router.push(ROUTE.ATLASES);
}
