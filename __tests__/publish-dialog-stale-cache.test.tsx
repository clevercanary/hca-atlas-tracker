// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { fetchResource } from "@/app/common/utils";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { SOURCE_DATASETS } from "@/app/views/AtlasSourceDatasetsView/hooks/UseFetchAtlasSourceDatasets/query/constants";
import { PublishDialog } from "@/app/views/AtlasView/components/PublishDialog/publishDialog";
import { INTEGRATED_OBJECTS } from "@/app/views/ComponentAtlasesView/hooks/UseFetchComponentAtlases/query/constants";
import { mockQueryClient } from "@/testing/query";
import { createQuerySnackbarWrapper } from "@/testing/snackbar";
import { createMockResponse } from "@/testing/utils";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";

const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

const TEST_PATH_PARAMETER = { atlasId: "test-atlas-id" };
const ATLAS_QUERY_KEY = [ATLAS, TEST_PATH_PARAMETER.atlasId];

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

describe("PublishDialog after a successful publish (#1551)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
  });

  it("invalidates the atlas and the lists publishing stamps", async () => {
    const { invalidatedKeys } = renderDialog();
    await publish();
    // Dispatched keys first, then the awaited atlas (see
    // `invalidateQueryCaches`).
    expect(invalidatedKeys()).toEqual([
      [INTEGRATED_OBJECTS, TEST_PATH_PARAMETER.atlasId],
      [SOURCE_DATASETS, TEST_PATH_PARAMETER.atlasId],
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
    const { resolve } = renderDialog();
    await publish();
    await landRefetch(resolve);

    expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(mockFetchResource).toHaveBeenCalledTimes(1);
  });

  it("doesn't close or latch on a failed publish", async () => {
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
