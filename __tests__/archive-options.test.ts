import { type PathParameter } from "@/app/common/entities";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { SOURCE_DATASETS } from "@/app/views/AtlasSourceDatasetsView/hooks/UseFetchAtlasSourceDatasets/query/constants";
import { getArchiveOptions as getSourceDatasetArchiveOptions } from "@/app/views/AtlasSourceDatasetView/common/utils";
import { SOURCE_DATASET } from "@/app/views/AtlasSourceDatasetView/hooks/UseFetchAtlasSourceDataset/query/constants";
import { getArchiveOptions as getIntegratedObjectArchiveOptions } from "@/app/views/ComponentAtlasView/common/utils";
import { INTEGRATED_OBJECT } from "@/app/views/ComponentAtlasView/hooks/UseFetchComponentAtlas/query/constants";
import { type QueryKey } from "@tanstack/react-query";

const PATH_PARAMETER: PathParameter = {
  atlasId: "test-atlas-id",
  componentAtlasId: "test-component-atlas-id",
  sourceDatasetId: "test-source-dataset-id",
};

const DETAIL_SOURCE_DATASET: QueryKey = [
  SOURCE_DATASET,
  PATH_PARAMETER.atlasId,
  PATH_PARAMETER.sourceDatasetId,
];

const DETAIL_INTEGRATED_OBJECT: QueryKey = [
  INTEGRATED_OBJECT,
  PATH_PARAMETER.atlasId,
  PATH_PARAMETER.componentAtlasId,
];

// These helpers only declare which caches to invalidate; performing and
// awaiting them is `useEditFileArchived`'s job, and the width of that window is
// pinned in `use-edit-file-archived`. What is pinned here is the split: which
// key the archive button waits on, and which are merely refreshed.
describe("getArchiveOptions", () => {
  describe("source dataset view", () => {
    it("awaits the detail invalidation and nothing else", () => {
      // The archive button stays disabled for as long as the awaited
      // invalidations take, and the guard that window exists for — not acting
      // twice on a stale `isArchived` — needs the detail refetch only. Awaiting
      // the atlas or list keys too would stretch the dead-button window to the
      // slowest of the three roundtrips.
      const { invalidateQueryKeys } =
        getSourceDatasetArchiveOptions(PATH_PARAMETER);

      expect(invalidateQueryKeys?.awaited).toEqual([DETAIL_SOURCE_DATASET]);
    });

    it("dispatches the atlas and list invalidations", () => {
      // The other half of the contract: narrowing what is *awaited* must not
      // narrow what is invalidated. Dropping these two would shorten the window
      // just as well and silently leave those caches stale.
      const { invalidateQueryKeys } =
        getSourceDatasetArchiveOptions(PATH_PARAMETER);

      expect(invalidateQueryKeys?.dispatched).toEqual([
        [ATLAS, PATH_PARAMETER.atlasId],
        [SOURCE_DATASETS, PATH_PARAMETER.atlasId],
      ]);
    });
  });

  describe("integrated object view", () => {
    it("awaits the detail invalidation and nothing else", () => {
      const { invalidateQueryKeys } =
        getIntegratedObjectArchiveOptions(PATH_PARAMETER);

      expect(invalidateQueryKeys?.awaited).toEqual([DETAIL_INTEGRATED_OBJECT]);
    });

    it("dispatches the atlas invalidation", () => {
      // The integrated object list is `staleTime: 0` and self-refreshes on
      // navigate-back, so one dispatched key here rather than the source
      // dataset view's two.
      const { invalidateQueryKeys } =
        getIntegratedObjectArchiveOptions(PATH_PARAMETER);

      expect(invalidateQueryKeys?.dispatched).toEqual([
        [ATLAS, PATH_PARAMETER.atlasId],
      ]);
    });
  });
});
