import Router from "next/router";
import {
  NewAtlasData,
  newAtlasSchema,
} from "../../../apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../common/entities";
import { ROUTE } from "../../../constants/routes";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";

export const REQUEST_METHOD = METHOD.POST;
export const REQUEST_URL = "/api/atlases/create";
const SCHEMA = newAtlasSchema;

export const useAddAtlasForm = (): FormMethod<NewAtlasData> => {
  return useForm<NewAtlasData>(SCHEMA);
};

/**
 * Side effect "onSuccess"; redirects to the edit atlas page.
 * @param id - Atlas ID.
 */
export function onSuccess(id: string): void {
  Router.push(`${ROUTE.ATLASES}/${id}/edit`);
}
