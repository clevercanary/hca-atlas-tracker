import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { METHOD, PathParameter } from "../../../common/entities";
import {
  fetchResource,
  getRequestURL,
  isFetchStatusCreated,
  isFetchStatusOk,
} from "../../../common/utils";

export interface UseSetLinkedAtlasSourceDatasets {
  onSetLinked: (sourceDatasetId: string, linked: boolean) => Promise<void>;
}

export const useSetLinkedAtlasSourceDatasets = (
  pathParameter: PathParameter
): UseSetLinkedAtlasSourceDatasets => {
  const onSetLinked = useCallback(
    async (sourceDatasetId: string, linked: boolean): Promise<void> => {
      const res = await fetchResource(
        getRequestURL(API.ATLAS_SOURCE_DATASET, {
          ...pathParameter,
          sourceDatasetId,
        }),
        linked ? METHOD.POST : METHOD.DELETE
      );
      if (
        !(linked
          ? isFetchStatusCreated(res.status)
          : isFetchStatusOk(res.status))
      ) {
        throw new Error(
          await res
            .json()
            .then(({ message }) => message)
            .catch(() => `Received ${res.status} response`)
        );
      }
    },
    [pathParameter]
  );

  return {
    onSetLinked,
  };
};
