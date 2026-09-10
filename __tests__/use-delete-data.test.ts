// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { fetchResource } from "@/app/common/utils";
import { useDeleteData } from "@/app/hooks/UseDeleteData/hook";
import {
  actAsync,
  renderHookWithSnackbar,
  snackbarMessages,
} from "@/testing/snackbar";
import { createMockResponse, withConsoleErrorHiding } from "@/testing/utils";

// Type mocks
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

// Test data
const TEST_REQUEST_URL = "/api/test-resource";

describe("useDeleteData", () => {
  let onSuccess: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Recreated per test so a mockImplementation set in one test can't leak
    // into the next (clearAllMocks doesn't reset implementations).
    onSuccess = jest.fn();
  });

  /**
   * Renders the hook under a real snackbar provider.
   *
   * Errors are asserted through the snackbar rather than through an injected
   * `onError`: the hook wires the snackbar itself, so there is nothing to
   * inject, and these assertions are end to end rather than against a mock.
   * @param options - Options to pass to the hook.
   * @returns render result exposing the hook and the snackbar.
   */
  function render(
    options: Parameters<typeof useDeleteData>[2] = { onSuccess },
  ): ReturnType<
    typeof renderHookWithSnackbar<ReturnType<typeof useDeleteData>>
  > {
    return renderHookWithSnackbar(() =>
      useDeleteData(TEST_REQUEST_URL, METHOD.DELETE, options),
    );
  }

  it("treats a 204 as failure by default, since isFetchStatusOk accepts only 200/304", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(204));

    const { result } = render();
    await expect(actAsync(() => result.current.hook.onDelete())).resolves.toBe(
      false,
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("forwards isSuccessStatus, so an endpoint answering 204 can be accepted", async () => {
    // The options type advertises isSuccessStatus; dropping it silently would
    // report a successful delete as a failure for any 204-returning endpoint.
    mockFetchResource.mockResolvedValue(createMockResponse(204));

    const { result } = render({
      isSuccessStatus: (status) => status === 204,
      onSuccess,
    });
    await expect(actAsync(() => result.current.hook.onDelete())).resolves.toBe(
      true,
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(snackbarMessages(result.current.snackbar)).toEqual([]);
  });

  it("resolves true and calls onSuccess on an OK response", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));

    const { result } = render();
    await expect(actAsync(() => result.current.hook.onDelete())).resolves.toBe(
      true,
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(snackbarMessages(result.current.snackbar)).toEqual([]);
  });

  it("resolves false and raises the API message on a non-OK response", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );

    const { result } = render();
    await expect(actAsync(() => result.current.hook.onDelete())).resolves.toBe(
      false,
    );
    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "Forbidden for this atlas",
    ]);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("joins field-level errors from an errors-shaped body", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(400, {
        errors: { ids: ["id is invalid"], name: ["name is required"] },
      }),
    );

    const { result } = render();
    await expect(actAsync(() => result.current.hook.onDelete())).resolves.toBe(
      false,
    );
    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "id is invalid; name is required",
    ]);
  });

  it("falls back to the status code when the error body is unparseable", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));

    const { result } = render();
    await expect(actAsync(() => result.current.hook.onDelete())).resolves.toBe(
      false,
    );
    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "Received 500 response",
    ]);
  });

  it("resolves false and raises a network-level error", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = render();
    await expect(actAsync(() => result.current.hook.onDelete())).resolves.toBe(
      false,
    );
    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "Failed to fetch",
    ]);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("resolves true when onSuccess throws (delete itself succeeded)", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    onSuccess.mockImplementation(() => {
      throw new Error("router error");
    });

    const { result } = render();
    await withConsoleErrorHiding(async () => {
      await expect(
        actAsync(() => result.current.hook.onDelete()),
      ).resolves.toBe(true);
    });
    expect(snackbarMessages(result.current.snackbar)).toEqual([]);
  });
});
