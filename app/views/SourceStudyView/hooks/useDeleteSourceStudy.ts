import { useCredentials } from "@databiosphere/findable-ui/lib/providers/authentication/credentials/hook";
import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { METHOD, PathParameter } from "../../../common/entities";
import {
  fetchResource,
  getRequestURL,
  getRouteURL,
  isFetchStatusOk,
} from "../../../common/utils";
import { ROUTE } from "../../../routes/constants";

export interface UseDeleteSourceStudy {
  onDelete: () => void;
}

export const useDeleteSourceStudy = (
  pathParameter: PathParameter
): UseDeleteSourceStudy => {
  const {
    credentialsState: { credentials: token },
  } = useCredentials();

  const onDelete = useCallback(async (): Promise<void> => {
    const res = await fetchResource(
      getRequestURL(API.ATLAS_SOURCE_STUDY, pathParameter),
      METHOD.DELETE,
      token
    );
    if (isFetchStatusOk(res.status)) {
      onDeleteSuccess(pathParameter);
    } else {
      throw new Error(
        await res
          .json()
          .then(({ message }) => message)
          .catch(() => `Received ${res.status} response`)
      );
    }
  }, [pathParameter, token]);

  return {
    onDelete,
  };
};

/**
 * Delete side effect "onSuccess"; redirects to the source studies page.
 * @param pathParameter - Path parameter.
 */
function onDeleteSuccess(pathParameter: PathParameter): void {
  Router.push(getRouteURL(ROUTE.SOURCE_STUDIES, pathParameter));
}
