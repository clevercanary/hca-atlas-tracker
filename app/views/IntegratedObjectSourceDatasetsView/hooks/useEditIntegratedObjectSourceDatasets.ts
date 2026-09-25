import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { METHOD, type PathParameter } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useDeleteData } from "@/app/hooks/UseDeleteData/hook";
import { INTEGRATED_OBJECT } from "@/app/views/ComponentAtlasView/hooks/UseFetchComponentAtlas/query/constants";
import { type IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { INTEGRATED_OBJECT_SOURCE_DATASETS } from "./UseFetchIntegratedObjectSourceDatasets/query/constants";

export interface UseEditIntegratedObjectSourceDatasets {
  onDelete: (payload?: {
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }) => Promise<boolean>;
}

export const useEditIntegratedObjectSourceDatasets = (
  pathParameter: PathParameter,
): UseEditIntegratedObjectSourceDatasets => {
  // A failed unlink is surfaced via the app-level error snackbar; onDelete
  // resolves false rather than rejecting. Every row hits this one URL and
  // differs only in `sourceDatasetIds`, which is what tells two rows apart.
  //
  // Both the integrated object detail and its source datasets list change when
  // datasets are removed. The list is what this view shows, so the request
  // stays pending until it has refetched; the detail is refreshed alongside
  // but not waited on. `useDeleteData` reads these keys at call time, so the
  // inline arrays don't remake `onDelete` every render.
  const { onDelete } = useDeleteData<{
    sourceDatasetIds: IntegratedObjectSourceDataset["id"][];
  }>(
    getRequestURL(API.ATLAS_COMPONENT_ATLAS_SOURCE_DATASETS, pathParameter),
    METHOD.DELETE,
    {
      invalidateQueryKeys: {
        awaited: [
          [
            INTEGRATED_OBJECT_SOURCE_DATASETS,
            pathParameter.atlasId,
            pathParameter.componentAtlasId,
          ],
        ],
        dispatched: [
          [
            INTEGRATED_OBJECT,
            pathParameter.atlasId,
            pathParameter.componentAtlasId,
          ],
        ],
      },
    },
  );

  return {
    onDelete,
  };
};
