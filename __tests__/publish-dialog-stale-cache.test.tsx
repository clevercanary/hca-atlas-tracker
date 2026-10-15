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
import { createMockResponse } from "@/testing/utils";
import { type QueryClient, useQuery } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { type JSX } from "react";

const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

const TEST_PATH_PARAMETER = { atlasId: "test-atlas-id" };
const ATLAS_QUERY_KEY = [ATLAS, TEST_PATH_PARAMETER.atlasId];
const TEST_DRAFT_ATLAS = { id: TEST_PATH_PARAMETER.atlasId, publishedAt: null };
const TEST_PUBLISHED_ATLAS = {
  id: TEST_PATH_PARAMETER.atlasId,
  publishedAt: "2026-10-14T00:00:00.000Z",
};

const mockAtlasQueryFn = jest.fn();

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
 * Renders the view stand-in against the given client.
 * @param queryClient - Query client.
 * @returns render result.
 */
function renderAtlasView(queryClient: QueryClient): ReturnType<typeof render> {
  const Providers = createQuerySnackbarWrapper(queryClient);
  return render(
    <Providers>
      <AtlasViewStandIn />
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
    expect(screen.getByText("Publish action")).toBeInTheDocument();

    await publish();
    await flush();
    expect(screen.queryByText("Publish action")).not.toBeInTheDocument();
    // Disabled from the refetched atlas, which now shows the publish, rather
    // than from anything the dialog holds.
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
