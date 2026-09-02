// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { fetchResource } from "@/app/common/utils";
import { type OnSubmitOptions } from "@/app/hooks/UseCreateAtlasRevision/entities";
import { useCreateAtlasRevision } from "@/app/hooks/UseCreateAtlasRevision/hook";
import {
  actAsync,
  renderHookWithSnackbar,
  type SnackbarHookResult,
} from "@/testing/snackbar";
import { createMockResponse, withConsoleErrorHiding } from "@/testing/utils";

// Type mocks
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

// Test data
const TEST_ATLAS = { id: "new-atlas-id" };
const TEST_REQUEST_URL = "/api/test-atlas-versions";

type Result = SnackbarHookResult<ReturnType<typeof useCreateAtlasRevision>>;

/**
 * Calls onSubmit inside act() and returns its resolved value.
 * @param result - Render result from renderHookWithSnackbar.
 * @param options - Submit options.
 * @returns promise (true on success).
 */
function submit(result: Result, options?: OnSubmitOptions): Promise<boolean> {
  return actAsync(() =>
    result.current.hook.onSubmit(TEST_REQUEST_URL, options),
  );
}

describe("useCreateAtlasRevision", () => {
  let onSuccess: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    onSuccess = jest.fn();
  });

  it("POSTs to the given URL and passes the created atlas to onSuccess on 201", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(201, TEST_ATLAS));

    const { result } = renderHookWithSnackbar(useCreateAtlasRevision);
    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(mockFetchResource).toHaveBeenCalledWith(
      TEST_REQUEST_URL,
      METHOD.POST,
      undefined,
    );
    expect(onSuccess).toHaveBeenCalledWith(TEST_ATLAS);
    expect(result.current.hook.succeeded).toBe(true);
    expect(result.current.hook.isRequesting).toBe(false);
    expect(result.current.snackbar.open).toBe(false);
  });

  it("treats a 200 as a failure (the endpoint answers 201)", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(200, { message: "Unexpected" }),
    );

    const { result } = renderHookWithSnackbar(useCreateAtlasRevision);
    await expect(submit(result, { onSuccess })).resolves.toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("opens the error snackbar and resolves false on a non-201 response", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );

    const { result } = renderHookWithSnackbar(useCreateAtlasRevision);
    await expect(submit(result, { onSuccess })).resolves.toBe(false);
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("Forbidden for this atlas");
    expect(onSuccess).not.toHaveBeenCalled();
    // Not thrown to the error boundary, and the dialog's buttons are usable
    // again rather than stuck disabled.
    expect(result.current.hook.succeeded).toBe(false);
    expect(result.current.hook.isRequesting).toBe(false);
  });

  it("opens the error snackbar and resolves false on a network-level error", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHookWithSnackbar(useCreateAtlasRevision);
    await expect(submit(result, { onSuccess })).resolves.toBe(false);
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("Failed to fetch");
    expect(result.current.hook.isRequesting).toBe(false);
  });

  it("dismisses a stale error from a previous attempt on success", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));
    const { result } = renderHookWithSnackbar(useCreateAtlasRevision);
    await submit(result);
    expect(result.current.snackbar.open).toBe(true);

    mockFetchResource.mockResolvedValue(createMockResponse(201, TEST_ATLAS));
    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(result.current.snackbar.open).toBe(false);
  });

  it("resolves true when onSuccess throws (the request itself succeeded)", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(201, TEST_ATLAS));
    onSuccess.mockImplementation(() => {
      // Stands in for the location.assign navigation the dialog performs.
      throw new Error("navigation error");
    });

    const { result } = renderHookWithSnackbar(useCreateAtlasRevision);
    await withConsoleErrorHiding(async () => {
      await expect(submit(result, { onSuccess })).resolves.toBe(true);
    });
    expect(result.current.hook.succeeded).toBe(true);
  });
});
