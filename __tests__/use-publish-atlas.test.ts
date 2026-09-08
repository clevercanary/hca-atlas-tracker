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
  snackbarMessages,
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
});
