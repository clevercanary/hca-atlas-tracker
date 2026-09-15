import { type PathParameter } from "@/app/common/entities";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { SOURCE_DATASETS } from "@/app/views/AtlasSourceDatasetsView/hooks/UseFetchAtlasSourceDatasets/query/constants";
import { getArchiveOptions as getSourceDatasetArchiveOptions } from "@/app/views/AtlasSourceDatasetView/common/utils";
import { SOURCE_DATASET } from "@/app/views/AtlasSourceDatasetView/hooks/UseFetchAtlasSourceDataset/query/constants";
import { getArchiveOptions as getIntegratedObjectArchiveOptions } from "@/app/views/ComponentAtlasView/common/utils";
import { INTEGRATED_OBJECT } from "@/app/views/ComponentAtlasView/hooks/UseFetchComponentAtlas/query/constants";
import { delay, promiseWithResolvers } from "@/testing/utils";
import { QueryClient, type QueryKey } from "@tanstack/react-query";

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

/**
 * A query client whose `invalidateQueries` resolves only when told to, so the
 * width of the awaited window can be observed.
 *
 * A real `QueryClient` with a spy rather than a hand-built object, so the mock
 * can't drift from the interface the helpers actually call.
 * @returns the client, the resolver for a named key, and the calls made.
 */
function mockQueryClient(): {
  invalidatedKeys: () => QueryKey[];
  queryClient: QueryClient;
  resolve: (queryKey: QueryKey) => void;
} {
  const resolvers = new Map<string, () => void>();
  const invalidated: QueryKey[] = [];
  const queryClient = new QueryClient();
  jest
    .spyOn(queryClient, "invalidateQueries")
    .mockImplementation((filters): Promise<void> => {
      const queryKey = filters?.queryKey ?? [];
      invalidated.push(queryKey);
      const [pending, respond] = promiseWithResolvers<void>();
      resolvers.set(JSON.stringify(queryKey), () => respond());
      return pending;
    });
  return {
    invalidatedKeys: (): QueryKey[] => invalidated,
    queryClient,
    resolve: (queryKey): void => resolvers.get(JSON.stringify(queryKey))?.(),
  };
}

/**
 * Whether a promise is still unsettled once the microtask queue has drained.
 * @param promise - Promise to inspect.
 * @returns true while the promise has neither resolved nor rejected.
 */
async function isPending(promise: Promise<unknown>): Promise<boolean> {
  let settled = false;
  const observe = (): void => {
    settled = true;
  };
  promise.then(observe, observe);
  await delay();
  return !settled;
}

describe("getArchiveOptions", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("source dataset view", () => {
    it("awaits the detail invalidation and nothing else", async () => {
      // The archive button stays disabled for as long as `onSuccess` takes, and
      // the guard that window exists for — not acting twice on a stale
      // `isArchived` — needs the detail refetch only.
      //
      // The detail key is resolved *alone*, leaving atlas and list pending. A
      // `Promise.all` of all three is still waiting at that point, so it fails
      // the second assertion. Resolving atlas and list first instead would pass
      // under both implementations — the `Promise.all` would simply be waiting
      // on detail too — which is no test at all.
      const { queryClient, resolve } = mockQueryClient();

      const pending = getSourceDatasetArchiveOptions(
        queryClient,
        PATH_PARAMETER,
      ).onSuccess?.();

      // Open while the detail refetch is in flight, so returning nothing (or an
      // already-settled promise) can't pass either.
      expect(await isPending(Promise.resolve(pending))).toBe(true);

      resolve(DETAIL_SOURCE_DATASET);
      expect(await isPending(Promise.resolve(pending))).toBe(false);
    });

    it("invalidates the detail, atlas and list caches", async () => {
      // The other half of the contract: narrowing what is *awaited* must not
      // narrow what is invalidated. Deleting the two unawaited calls would
      // shorten the window just as well and silently leave those caches stale.
      const { invalidatedKeys, queryClient, resolve } = mockQueryClient();

      const pending = getSourceDatasetArchiveOptions(
        queryClient,
        PATH_PARAMETER,
      ).onSuccess?.();
      // Every key settled, so this test can't hang on whatever is awaited —
      // the width of that window is the test above's business, not this one's.
      resolve(DETAIL_SOURCE_DATASET);
      resolve([ATLAS, PATH_PARAMETER.atlasId]);
      resolve([SOURCE_DATASETS, PATH_PARAMETER.atlasId]);
      await pending;

      expect(invalidatedKeys()).toEqual(
        expect.arrayContaining([
          DETAIL_SOURCE_DATASET,
          [ATLAS, PATH_PARAMETER.atlasId],
          [SOURCE_DATASETS, PATH_PARAMETER.atlasId],
        ]),
      );
      expect(invalidatedKeys()).toHaveLength(3);
    });
  });

  describe("integrated object view", () => {
    it("awaits the detail invalidation and nothing else", async () => {
      // Detail resolved alone, atlas left pending — see the source dataset
      // copy above for why the order is load-bearing.
      const { queryClient, resolve } = mockQueryClient();

      const pending = getIntegratedObjectArchiveOptions(
        queryClient,
        PATH_PARAMETER,
      ).onSuccess?.();

      expect(await isPending(Promise.resolve(pending))).toBe(true);

      resolve(DETAIL_INTEGRATED_OBJECT);
      expect(await isPending(Promise.resolve(pending))).toBe(false);
    });

    it("invalidates the detail and atlas caches", async () => {
      // The atlas list is `staleTime: 0` and self-refreshes, so two keys here
      // rather than the source dataset view's three.
      const { invalidatedKeys, queryClient, resolve } = mockQueryClient();

      const pending = getIntegratedObjectArchiveOptions(
        queryClient,
        PATH_PARAMETER,
      ).onSuccess?.();
      resolve(DETAIL_INTEGRATED_OBJECT);
      resolve([ATLAS, PATH_PARAMETER.atlasId]);
      await pending;

      expect(invalidatedKeys()).toEqual(
        expect.arrayContaining([
          DETAIL_INTEGRATED_OBJECT,
          [ATLAS, PATH_PARAMETER.atlasId],
        ]),
      );
      expect(invalidatedKeys()).toHaveLength(2);
    });
  });
});
