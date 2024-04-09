import Router from "next/router";
import {
  NewSourceDatasetData,
  newSourceDatasetSchema,
} from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { ROUTE } from "../../../routes/constants";

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
