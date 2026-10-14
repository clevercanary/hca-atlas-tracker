// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { fetchResource } from "@/app/common/utils";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { makeQueryClient } from "@/app/query/queryClient";
import { SOURCE_DATASET } from "@/app/views/AtlasSourceDatasetView/hooks/UseFetchAtlasSourceDataset/query/constants";
import { PublishDialog } from "@/app/views/AtlasView/components/PublishDialog/publishDialog";
import { INTEGRATED_OBJECT } from "@/app/views/ComponentAtlasView/hooks/UseFetchComponentAtlas/query/constants";
import { mockQueryClient } from "@/testing/query";
import { createQuerySnackbarWrapper } from "@/testing/snackbar";
import {
  createMockResponse,
  promiseWithResolvers,
  withConsoleErrorHiding,
} from "@/testing/utils";
import { type QueryClient, useQuery } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { Component, type JSX, type ReactNode } from "react";

const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

const TEST_PATH_PARAMETER = { atlasId: "test-atlas-id" };
const ATLAS_QUERY_KEY = [ATLAS, TEST_PATH_PARAMETER.atlasId];
const TEST_DRAFT_ATLAS = { id: TEST_PATH_PARAMETER.atlasId, publishedAt: null };
// A different identifier from the path's, as when the view was loaded by
// another one: the response is merged into the view's key, not its own `id`'s.
const TEST_PUBLISHED_ATLAS = {
  id: "test-atlas-uuid",
  publishedAt: "2026-10-14T00:00:00.000Z",
};

const mockAtlasQueryFn = jest.fn();

/**
 * Stands in for the app's `ErrorBoundary`: the atlas query re-throws a failed
 * fetch during render, and the app's boundary swaps the page for an error page.
 */
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error?: Error }
> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  render(): ReactNode {
    return this.state.error ? "error page" : this.props.children;
  }
}

/**
 * Stands in for `AtlasView`: the atlas query, with the app's defaults, the
 * Publish action computed from it the way the view computes `canPublish`, and
 * the dialog given the same atlas.
 * @returns the view.
 */
function AtlasViewStandIn(): JSX.Element {
  const { data } = useQuery({
    queryFn: mockAtlasQueryFn,
    queryKey: ATLAS_QUERY_KEY,
  });
  return (
    <>
      {data?.publishedAt === null && <span>Publish action</span>}
      <PublishDialog
        atlas={data}
        onCancel={(): void => undefined}
        onPublished={(): void => undefined}
        open
        pathParameter={TEST_PATH_PARAMETER}
      />
    </>
  );
}

/**
 * Lets pending promises and timers settle.
 * @returns promise resolving after a macrotask.
 */
function flush(): Promise<void> {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

/**
 * Settles the atlas refetch.
 * @param resolve - Query client resolver.
 * @returns promise resolving once the dialog has reacted.
 */
async function landRefetch(
  resolve: ReturnType<typeof mockQueryClient>["resolve"],
): Promise<void> {
  await act(async () => {
    resolve(ATLAS_QUERY_KEY);
  });
}

/**
 * Clicks Publish and lets the request itself settle; the atlas refetch is left
 * pending.
 * @returns promise resolving once the request has been answered.
 */
async function publish(): Promise<void> {
  await act(async () => {
    screen.getByRole("button", { name: "Publish" }).click();
  });
}

/**
 * Renders the view stand-in under a boundary, against the given client.
 * @param queryClient - Query client, shared across mounts as the app's is.
 * @returns render result.
 */
function renderAtlasView(queryClient: QueryClient): ReturnType<typeof render> {
  const Providers = createQuerySnackbarWrapper(queryClient);
  return render(
    <Providers>
      <ErrorBoundary>
        <AtlasViewStandIn />
      </ErrorBoundary>
    </Providers>,
  );
}

/**
 * Renders the dialog open against a query client whose invalidations settle
 * only when the test says so.
 * @returns the onPublished mock and the query client controls.
 */
function renderDialog(): {
  invalidatedKeys: ReturnType<typeof mockQueryClient>["invalidatedKeys"];
  onPublished: jest.Mock;
  resolve: ReturnType<typeof mockQueryClient>["resolve"];
} {
  const { invalidatedKeys, queryClient, resolve } = mockQueryClient();
  const Providers = createQuerySnackbarWrapper(queryClient);
  const onPublished = jest.fn();
  render(
    <Providers>
      <PublishDialog
        atlas={undefined}
        onCancel={(): void => undefined}
        onPublished={onPublished}
        open
        pathParameter={TEST_PATH_PARAMETER}
      />
    </Providers>,
  );
  return { invalidatedKeys, onPublished, resolve };
}

describe("PublishDialog after a successful publish (#1551)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
  });

  it("invalidates the atlas and the detail queries publishing stamps", async () => {
    const { invalidatedKeys } = renderDialog();
    await publish();
    // Dispatched keys first, then the awaited atlas (see
    // `invalidateQueryCaches`).
    expect(invalidatedKeys()).toEqual([
      [INTEGRATED_OBJECT, TEST_PATH_PARAMETER.atlasId],
      [SOURCE_DATASET, TEST_PATH_PARAMETER.atlasId],
      ATLAS_QUERY_KEY,
    ]);
  });

  it("stays open and disabled until the refetched atlas lands", async () => {
    const { onPublished, resolve } = renderDialog();
    await publish();

    // Closing here would hand the user back a Publish action still computed
    // from the stale cached atlas.
    expect(onPublished).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    await landRefetch(resolve);
    expect(onPublished).toHaveBeenCalledTimes(1);
  });

  it("keeps Publish disabled once the request has settled", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(200, TEST_PUBLISHED_ATLAS),
    );
    mockAtlasQueryFn
      .mockResolvedValueOnce(TEST_DRAFT_ATLAS)
      .mockResolvedValueOnce(TEST_PUBLISHED_ATLAS);
    renderAtlasView(makeQueryClient());
    await flush();
    expect(screen.getByRole("button", { name: "Publish" })).toBeEnabled();

    await publish();
    await flush();
    // Disabled from the cached atlas, which now shows the publish, rather than
    // from anything the dialog holds — so a remount can't re-enable it.
    expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(mockFetchResource).toHaveBeenCalledTimes(1);
  });

  it("doesn't close on a failed publish", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );
    const { invalidatedKeys, onPublished } = renderDialog();
    await publish();

    expect(invalidatedKeys()).toEqual([]);
    expect(onPublished).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Publish" })).toBeEnabled();
  });
});

describe("PublishDialog when the atlas refetch fails after a publish", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchResource.mockResolvedValue(
      createMockResponse(200, TEST_PUBLISHED_ATLAS),
    );
  });

  it("doesn't offer Publish again on returning to the atlas", async () => {
    await withConsoleErrorHiding(async () => {
      // Failed only once the publish response has been handled, as a GET
      // failing over the network would.
      const [refetch, , failRefetch] = promiseWithResolvers<never>();
      mockAtlasQueryFn
        .mockResolvedValueOnce(TEST_DRAFT_ATLAS)
        .mockReturnValueOnce(refetch)
        // The refetch on returning to the atlas is held, so the view renders
        // from the cache meanwhile — the window a second POST would need.
        .mockReturnValueOnce(new Promise(() => undefined));
      const queryClient = makeQueryClient();

      const { unmount } = renderAtlasView(queryClient);
      await flush();
      expect(screen.getByText("Publish action")).toBeInTheDocument();

      await publish();
      await act(async () => {
        failRefetch(new Error("GET failed"));
      });
      await flush();
      expect(screen.getByText("error page")).toBeInTheDocument();

      // "To Homepage", then back: a fresh view and dialog, with only the cache
      // to carry the publish over.
      unmount();
      renderAtlasView(queryClient);
      await flush();
      expect(mockAtlasQueryFn).toHaveBeenCalledTimes(3);
      expect(screen.queryByText("Publish action")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled();
    });
  });

  it("doesn't offer Publish again when the refetch fails before the response is handled", async () => {
    await withConsoleErrorHiding(async () => {
      // A GET failing fast (offline, say), before the publish body is read.
      mockAtlasQueryFn
        .mockResolvedValueOnce(TEST_DRAFT_ATLAS)
        .mockRejectedValueOnce(new Error("GET failed"));
      const queryClient = makeQueryClient();

      const { unmount } = renderAtlasView(queryClient);
      await flush();
      await publish();
      await flush();
      // The merge lands after the failure and replaces it with the published
      // atlas, so the view stays up, without the Publish action.
      expect(screen.queryByText("error page")).not.toBeInTheDocument();
      expect(screen.queryByText("Publish action")).not.toBeInTheDocument();

      unmount();
      renderAtlasView(queryClient);
      await flush();
      expect(screen.queryByText("Publish action")).not.toBeInTheDocument();
    });
  });
});
