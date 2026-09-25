import {
  type HCAAtlasTrackerAtlas,
  type HCAAtlasTrackerComponentAtlas,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { type Breadcrumb } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import {
  getAtlasBreadcrumb,
  getAtlasesBreadcrumb,
  getComponentAtlasBreadcrumb,
  getComponentAtlasesBreadcrumb,
} from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/common/utils";
import { type OnSubmitOptions } from "@/app/hooks/UseEditFileArchived/types";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { ROUTE } from "@/app/routes/constants";
import { INTEGRATED_OBJECT } from "@/app/views/ComponentAtlasView/hooks/UseFetchComponentAtlas/query/constants";
import { type QueryKey as IntegratedObjectQueryKey } from "@/app/views/ComponentAtlasView/hooks/UseFetchComponentAtlas/query/types";
import { type Tab } from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";

/**
 * Returns the archive/unarchive options for the integrated object view.
 *
 * Archiving changes the integrated object detail (`isArchived`) and
 * atlas-derived data, so both caches are invalidated. The integrated object
 * list needs no entry: it isn't mounted on this view, and it sets
 * `staleTime: 0`, so it refetches on navigate-back on its own.
 *
 * Only the detail invalidation is awaited. The archive button stays disabled
 * for as long as the hook's success handling takes, and the guard that window
 * exists for — not acting twice on a stale `isArchived` — depends on the detail
 * refetch alone. The atlas invalidation is for cache correctness elsewhere, so
 * it is dispatched rather than awaited: awaiting it stretched the dead-button
 * window to whichever roundtrip was slower, and `useFetchAtlas` is mounted on
 * this view, so the atlas key triggers a live refetch on every click.
 * @param pathParameter - Path parameter.
 * @returns archive/unarchive options.
 */
export function getArchiveOptions(
  pathParameter: PathParameter,
): OnSubmitOptions {
  // Typed as the fetch hook's own key tuple, so a segment added to the detail
  // key is a compile error here rather than an invalidation matching nothing —
  // which resolves immediately and silently shrinks this window back to the
  // request alone.
  const detailQueryKey: IntegratedObjectQueryKey = [
    INTEGRATED_OBJECT,
    pathParameter.atlasId,
    pathParameter.componentAtlasId,
  ];
  return {
    invalidateQueryKeys: {
      awaited: [detailQueryKey],
      dispatched: [[ATLAS, pathParameter.atlasId]],
    },
  };
}

/**
 * Returns the breadcrumbs for the component atlas view.
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
    getComponentAtlasesBreadcrumb(pathParameter),
    getComponentAtlasBreadcrumb(),
  ];
}

/**
 * Returns the tabs for the integrated object view.
 * @param componentAtlas - Component atlas.
 * @returns tabs.
 */
export function getTabs(componentAtlas?: HCAAtlasTrackerComponentAtlas): Tab[] {
  const { sourceDatasetCount = 0 } = componentAtlas || {};
  return [
    { label: "Overview", value: ROUTE.COMPONENT_ATLAS },
    { label: "Validations", value: ROUTE.INTEGRATED_OBJECT_VALIDATIONS },
    {
      label: `Source Datasets ${
        sourceDatasetCount ? `(${sourceDatasetCount})` : ""
      }`,
      value: ROUTE.INTEGRATED_OBJECT_SOURCE_DATASETS,
    },
  ];
}
