import Router from "next/router";
import { getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { useForm } from "../../../hooks/useForm/useForm";
import { ROUTE } from "../../../routes/constants";
import { NewAtlasData } from "../common/entities";
import { newAtlasSchema } from "../common/schema";

const SCHEMA = newAtlasSchema;

export const useAddAtlasForm = (): FormMethod<NewAtlasData> => {
  return useForm<NewAtlasData>(SCHEMA);
};

/**
 * Side effect "onSuccess"; redirects to the edit atlas page.
 * @param id - Atlas ID.
 */
export function onSuccess(id: string): void {
  Router.push(getRouteURL(ROUTE.EDIT_ATLAS, id));
}
