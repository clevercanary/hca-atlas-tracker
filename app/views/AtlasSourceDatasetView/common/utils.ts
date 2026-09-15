import { type HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { type Breadcrumb } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import {
  getAtlasBreadcrumb,
  getAtlasesBreadcrumb,
  getAtlasSourceDatasetBreadcrumb,
  getAtlasSourceDatasetsBreadcrumb,
} from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/common/utils";
import { type OnSubmitOptions } from "@/app/hooks/UseEditFileArchived/entities";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { ROUTE } from "@/app/routes/constants";
import { SOURCE_DATASETS } from "@/app/views/AtlasSourceDatasetsView/hooks/UseFetchAtlasSourceDatasets/query/constants";
import { SOURCE_DATASET } from "@/app/views/AtlasSourceDatasetView/hooks/UseFetchAtlasSourceDataset/query/constants";
import { type QueryKey as SourceDatasetQueryKey } from "@/app/views/AtlasSourceDatasetView/hooks/UseFetchAtlasSourceDataset/query/types";
import { type Tab } from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { type QueryClient } from "@tanstack/react-query";

/**
 * Returns the archive/unarchive options for the source dataset view.
 *
 * Archiving changes the source dataset detail (`isArchived`) and atlas-derived
 * data, so three caches are invalidated: the detail, the atlas and the list.
 *
 * The list entry is belt-and-braces rather than load-bearing. That query isn't
 * mounted on this view, so with the default `refetchType: "active"` this only
 * marks it stale — and it sets `staleTime: 0`, so it would refetch on
 * navigate-back regardless. (`getArchiveOptions` in `ComponentAtlasView` omits
 * its list for exactly that reason; the two differ only in that this one keeps
 * the explicit call.)
 *
 * Only the detail invalidation is returned. `onSubmit` awaits `onSuccess`, so
 * whatever is returned holds the archive button disabled, and the guard that
 * window exists for — not acting twice on a stale `isArchived` — depends on the
 * detail refetch alone. The other two are for cache correctness elsewhere, so
 * they are fired rather than awaited: awaiting them stretched the dead-button
 * window to the slowest of the three roundtrips, and `useFetchAtlas` is mounted
 * on this view, so the atlas key triggers a live refetch on every click.
 *
 * Dropping the await loses no error handling. `refetchQueries` catches each
 * query's rejection itself unless `throwOnError` is set, which it isn't here,
 * so these promises resolve either way and there is nothing for a `catch` to
 * do.
 * @param queryClient - Query client.
 * @param pathParameter - Path parameter.
 * @returns archive/unarchive options.
 */
export function getArchiveOptions(
  queryClient: QueryClient,
  pathParameter: PathParameter,
): OnSubmitOptions {
  return {
    onSuccess: (): Promise<unknown> => {
      // Typed as the fetch hook's own key tuple: a segment added to the detail
      // key (the list keys already carry an `archived` one) is then a compile
      // error here, rather than an invalidation matching nothing — which
      // resolves immediately and silently shrinks this window back to the
      // request alone.
      const queryKey: SourceDatasetQueryKey = [
        SOURCE_DATASET,
        pathParameter.atlasId,
        pathParameter.sourceDatasetId,
      ];
      const detail = queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({
        queryKey: [ATLAS, pathParameter.atlasId],
      });
      queryClient.invalidateQueries({
        queryKey: [SOURCE_DATASETS, pathParameter.atlasId],
      });
      return detail;
    },
  };
}

/**
 * Returns the breadcrumbs for the source dataset view.
 * @param pathParameter - Path parameter.
 * @param atlas - Atlas.
 * @returns breadcrumbs.
 */
export function getBreadcrumbs(
  pathParameter: PathParameter,
  atlas?: HCAAtlasTrackerAtlas,
): Breadcrumb[] {
  return [
    getAtlasesBreadcrumb(),
    getAtlasBreadcrumb(pathParameter, atlas),
    getAtlasSourceDatasetsBreadcrumb(pathParameter),
    getAtlasSourceDatasetBreadcrumb(),
  ];
}

/**
 * Returns the tabs for the source dataset view.
 * @returns tabs.
 */
export function getTabs(): Tab[] {
  return [
    { label: "Overview", value: ROUTE.ATLAS_SOURCE_DATASET },
    { label: "Validations", value: ROUTE.ATLAS_SOURCE_DATASET_VALIDATIONS },
  ];
}
