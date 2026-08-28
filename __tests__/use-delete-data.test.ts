import { renderHook } from "@testing-library/react";

// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { fetchResource } from "@/app/common/utils";
import { useDeleteData } from "@/app/hooks/UseDeleteData/hook";
import { createMockResponse, withConsoleErrorHiding } from "@/testing/utils";

// Type mocks
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

// Test data
const TEST_REQUEST_URL = "/api/test-resource";

describe("useDeleteData", () => {
  let onError: jest.Mock;
  let onSuccess: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Recreated per test so a mockImplementation set in one test can't leak
    // into the next (clearAllMocks doesn't reset implementations).
    onError = jest.fn();
    onSuccess = jest.fn();
  });

  function renderOnDelete(): ReturnType<typeof useDeleteData>["onDelete"] {
    const { result } = renderHook(() =>
      useDeleteData(TEST_REQUEST_URL, undefined, { onError, onSuccess }),
    );
    return result.current.onDelete;
  }

  it("treats a 204 as failure by default, since isFetchStatusOk accepts only 200/304", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(204));

    await expect(renderOnDelete()()).resolves.toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("forwards isSuccessStatus, so an endpoint answering 204 can be accepted", async () => {
    // The options type advertises isSuccessStatus; dropping it silently would
    // report a successful delete as a failure for any 204-returning endpoint.
    mockFetchResource.mockResolvedValue(createMockResponse(204));

    const { result } = renderHook(() =>
      useDeleteData(TEST_REQUEST_URL, undefined, {
        isSuccessStatus: (status) => status === 204,
        onError,
        onSuccess,
      }),
    );

    await expect(result.current.onDelete()).resolves.toBe(true);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("resolves true and calls onSuccess on an OK response", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));

    await expect(renderOnDelete()()).resolves.toBe(true);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("resolves false and routes the API message to onError on a non-OK response", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );

    await expect(renderOnDelete()()).resolves.toBe(false);
    expect(onError).toHaveBeenCalledWith(new Error("Forbidden for this atlas"));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("joins field-level errors from an errors-shaped body", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(400, {
        errors: { ids: ["id is invalid"], name: ["name is required"] },
      }),
    );

    await expect(renderOnDelete()()).resolves.toBe(false);
    expect(onError).toHaveBeenCalledWith(
      new Error("id is invalid; name is required"),
    );
  });

  it("falls back to the status code when the error body is unparseable", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));

    await expect(renderOnDelete()()).resolves.toBe(false);
    expect(onError).toHaveBeenCalledWith(new Error("Received 500 response"));
  });

  it("resolves false and routes a network-level error to onError", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));

    await expect(renderOnDelete()()).resolves.toBe(false);
    expect(onError).toHaveBeenCalledWith(new Error("Failed to fetch"));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("resolves false when onError throws (never-rejects contract)", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));
    onError.mockImplementation(() => {
      throw new Error("handler error");
    });

    await withConsoleErrorHiding(async () => {
      await expect(renderOnDelete()()).resolves.toBe(false);
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("resolves true when onSuccess throws (delete itself succeeded)", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    onSuccess.mockImplementation(() => {
      throw new Error("router error");
    });

    await withConsoleErrorHiding(async () => {
      await expect(renderOnDelete()()).resolves.toBe(true);
    });
    expect(onError).not.toHaveBeenCalled();
  });
});
