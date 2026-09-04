// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { fetchResource } from "@/app/common/utils";
import { type OnSubmitOptions } from "@/app/hooks/UsePublishAtlas/entities";
import { usePublishAtlas } from "@/app/hooks/UsePublishAtlas/hook";
import {
  actAsync,
  renderHookWithSnackbar,
  type SnackbarHookResult,
} from "@/testing/snackbar";
import { createMockResponse } from "@/testing/utils";

// Type mocks
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

// Test data
const TEST_REQUEST_URL = "/api/test-publish";

type Result = SnackbarHookResult<typeof usePublishAtlas>;

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
    expect(result.current.hook.isRequesting).toBe(false);
  });

  it("opens the error snackbar and resets isRequesting on a non-OK response", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );

    const { result } = renderHookWithSnackbar(usePublishAtlas);
    await expect(submit(result, { onSuccess })).resolves.toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("Forbidden for this atlas");
    // The dialog buttons are disabled on isRequesting, so a failure must
    // reset it or the dialog is permanently dead.
    expect(result.current.hook.isRequesting).toBe(false);
  });

  it("opens the error snackbar and resets isRequesting on a network-level error", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHookWithSnackbar(usePublishAtlas);
    await expect(submit(result, { onSuccess })).resolves.toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("Failed to fetch");
    expect(result.current.hook.isRequesting).toBe(false);
  });

  it("dismisses a stale error from a previous attempt on success", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));
    const { result } = renderHookWithSnackbar(usePublishAtlas);
    await submit(result);
    expect(result.current.snackbar.open).toBe(true);

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(result.current.snackbar.open).toBe(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
