// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { fetchResource } from "@/app/common/utils";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { type QueryKey as AtlasQueryKey } from "@/app/hooks/UseFetchAtlas/query/types";
import { type OnSubmitOptions } from "@/app/hooks/UsePublishAtlas/entities";
import { usePublishAtlas } from "@/app/hooks/UsePublishAtlas/hook";
import {
  actAsync,
  renderHookWithSnackbar,
  type SnackbarHookResult,
  snackbarMessages,
} from "@/testing/snackbar";
import { createMockResponse, responseWithText } from "@/testing/utils";
import { QueryClient } from "@tanstack/react-query";

// Type mocks
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

// Test data
const TEST_REQUEST_URL = "/api/test-publish";
const TEST_ATLAS_QUERY_KEY: AtlasQueryKey = [ATLAS, "test-atlas-slug"];
const TEST_CACHED_ATLAS = {
  id: "test-atlas-uuid",
  publishedAt: null,
  shortName: "test-atlas",
};
const TEST_PUBLISHED_ATLAS = {
  id: "test-atlas-uuid",
  publishedAt: "2026-10-14T00:00:00.000Z",
};

type Result = SnackbarHookResult<typeof usePublishAtlas>;

/**
 * Calls onSubmit inside act() and returns its resolved value.
 * @param result - Render result from renderHookWithSnackbar.
 * @param options - Submit options.
 * @returns promise (true on success).
 */
function submit(result: Result, options?: OnSubmitOptions): Promise<boolean> {
  return actAsync(() =>
    result.current.hook.actions.onSubmit(TEST_REQUEST_URL, options),
  );
}

describe("usePublishAtlas", () => {
  let onSuccess: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    onSuccess = jest.fn();
  });

  it("POSTs to the given URL and resolves true on an OK response", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));

    const { result } = renderHookWithSnackbar(usePublishAtlas);
    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(mockFetchResource).toHaveBeenCalledWith(
      TEST_REQUEST_URL,
      METHOD.POST,
      undefined,
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.hook.status.isRequesting).toBe(false);
  });

  it("returns the error inline and resets isRequesting on a non-OK response", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );

    const { result } = renderHookWithSnackbar(usePublishAtlas);
    await expect(submit(result, { onSuccess })).resolves.toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.hook.status.error).toBe("Forbidden for this atlas");
    // Routed inline, not onto the app stack: this dialog stays open on
    // failure, and the stack is covered and aria-hidden while it is.
    expect(snackbarMessages(result.current.snackbar)).toEqual([]);
    // The dialog buttons are disabled on isRequesting, so a failure must
    // reset it or the dialog is permanently dead.
    expect(result.current.hook.status.isRequesting).toBe(false);
  });

  it("returns the error inline and resets isRequesting on a network-level error", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHookWithSnackbar(usePublishAtlas);
    await expect(submit(result, { onSuccess })).resolves.toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.hook.status.error).toBe("Failed to fetch");
    // Routed inline, not onto the app stack: this dialog stays open on
    // failure, and the stack is covered and aria-hidden while it is.
    expect(snackbarMessages(result.current.snackbar)).toEqual([]);
    expect(result.current.hook.status.isRequesting).toBe(false);
  });

  it("clears the error when a later attempt succeeds", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));
    const { result } = renderHookWithSnackbar(usePublishAtlas);
    await submit(result);
    expect(result.current.hook.status.error).toBeDefined();

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(result.current.hook.status.error).toBeUndefined();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("merges the published atlas's publishedAt into the given atlas query", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(200, TEST_PUBLISHED_ATLAS),
    );
    const queryClient = new QueryClient();
    queryClient.setQueryData(TEST_ATLAS_QUERY_KEY, TEST_CACHED_ATLAS);

    const { result } = renderHookWithSnackbar(usePublishAtlas, queryClient);
    await expect(
      submit(result, { atlasQueryKey: TEST_ATLAS_QUERY_KEY, onSuccess }),
    ).resolves.toBe(true);
    // The cache survives a remount, so a view remounted after a failed
    // refetch still renders the atlas as published. Only `publishedAt` is
    // taken from the body — its other fields (here an `id` from another
    // identifier) are left to the refetch — and it's written to the caller's
    // key, not one built from the response's `id`.
    expect(queryClient.getQueryData(TEST_ATLAS_QUERY_KEY)).toEqual({
      ...TEST_CACHED_ATLAS,
      publishedAt: TEST_PUBLISHED_ATLAS.publishedAt,
    });
    expect(
      queryClient.getQueryData([ATLAS, TEST_PUBLISHED_ATLAS.id]),
    ).toBeUndefined();
  });

  it("doesn't create a cache entry when none is cached", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(200, TEST_PUBLISHED_ATLAS),
    );
    const queryClient = new QueryClient();

    const { result } = renderHookWithSnackbar(usePublishAtlas, queryClient);
    await submit(result, { atlasQueryKey: TEST_ATLAS_QUERY_KEY });
    expect(queryClient.getQueryData(TEST_ATLAS_QUERY_KEY)).toBeUndefined();
  });

  it.each([
    ["an empty body", createMockResponse(200)],
    ["a non-JSON body", { ...responseWithText("<html>"), status: 200 }],
    ["a body that isn't a published atlas", createMockResponse(200, {})],
  ])(
    "still succeeds, leaving the cache alone, on %s",
    async (_label, response) => {
      mockFetchResource.mockResolvedValue(response);
      const queryClient = new QueryClient();
      queryClient.setQueryData(TEST_ATLAS_QUERY_KEY, TEST_CACHED_ATLAS);

      const { result } = renderHookWithSnackbar(usePublishAtlas, queryClient);
      // The atlas is published by then, so an unreadable body mustn't be
      // reported as a failure.
      await expect(
        submit(result, { atlasQueryKey: TEST_ATLAS_QUERY_KEY, onSuccess }),
      ).resolves.toBe(true);
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(result.current.hook.status.error).toBeUndefined();
      expect(queryClient.getQueryData(TEST_ATLAS_QUERY_KEY)).toEqual(
        TEST_CACHED_ATLAS,
      );
    },
  );
});
