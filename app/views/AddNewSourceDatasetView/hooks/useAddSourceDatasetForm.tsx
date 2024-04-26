import Router from "next/router";
import { getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { ROUTE } from "../../../routes/constants";
import { FIELD_NAME } from "../common/constants";
import { NewSourceDatasetData } from "../common/entities";
import { newSourceDatasetSchema } from "../common/schema";

const SCHEMA = newSourceDatasetSchema;

export const useAddSourceDatasetForm = (): FormMethod<NewSourceDatasetData> => {
  return useForm<NewSourceDatasetData>(SCHEMA);
};

/**
 * Side effect "onSuccess"; redirects to the edit source dataset page.
 * @param atlasId - Atlas ID.
 * @param sdId - Source dataset ID.
 */
export function onSuccess(atlasId: string, sdId: string): void {
  Router.push(getRouteURL(ROUTE.EDIT_ATLAS_SOURCE_DATASET, atlasId, sdId));
}

/**
 * Returns a list of source dataset fields to be unregistered prior to submission.
 * @param payload - Source dataset data.
 * @returns fields to be unregistered.
 */
export function unregisterSourceDatasetFields(
  payload: NewSourceDatasetData
): (keyof NewSourceDatasetData)[] {
  if (payload.isPublished) {
    return [
      FIELD_NAME.CONTACT_EMAIL,
      FIELD_NAME.IS_PUBLISHED,
      FIELD_NAME.REFERENCE_AUTHOR,
      FIELD_NAME.TITLE,
    ];
  }
  return [FIELD_NAME.DOI, FIELD_NAME.IS_PUBLISHED];
}
