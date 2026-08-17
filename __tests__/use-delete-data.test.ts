import { renderHook } from "@testing-library/react";

// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { fetchResource } from "@/app/common/utils";
import { useDeleteData } from "@/app/hooks/UseDeleteData/hook";
import { withConsoleErrorHiding } from "@/testing/utils";

// Type mocks
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

// Test data
const TEST_REQUEST_URL = "/api/test-resource";

/**
 * Builds a minimal mock Response with the given status and JSON body.
 * @param status - Response status.
 * @param body - Parsed JSON body (json() rejects when omitted).
 * @returns mock response.
 */
function mockResponse(status: number, body?: unknown): Response {
  return {
    json: async (): Promise<unknown> => {
      if (body === undefined) throw new Error("no body");
      return body;
    },
    status,
  } as Response;
}

describe("useDeleteData", () => {
  const onError = jest.fn();
  const onSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderOnDelete(): ReturnType<typeof useDeleteData>["onDelete"] {
    const { result } = renderHook(() =>
      useDeleteData(TEST_REQUEST_URL, undefined, { onError, onSuccess }),
    );
    return result.current.onDelete;
  }

  it("resolves true and calls onSuccess on an OK response", async () => {
    mockFetchResource.mockResolvedValue(mockResponse(200, {}));

    await expect(renderOnDelete()()).resolves.toBe(true);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("resolves false and routes the API message to onError on a non-OK response", async () => {
    mockFetchResource.mockResolvedValue(
      mockResponse(403, { message: "Forbidden for this atlas" }),
    );

    await expect(renderOnDelete()()).resolves.toBe(false);
    expect(onError).toHaveBeenCalledWith(new Error("Forbidden for this atlas"));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("joins field-level errors from an errors-shaped body", async () => {
    mockFetchResource.mockResolvedValue(
      mockResponse(400, {
        errors: { ids: ["id is invalid"], name: ["name is required"] },
      }),
    );

    await expect(renderOnDelete()()).resolves.toBe(false);
    expect(onError).toHaveBeenCalledWith(
      new Error("id is invalid; name is required"),
    );
  });

  it("falls back to the status code when the error body is unparseable", async () => {
    mockFetchResource.mockResolvedValue(mockResponse(500));

    await expect(renderOnDelete()()).resolves.toBe(false);
    expect(onError).toHaveBeenCalledWith(new Error("Received 500 response"));
  });

  it("resolves false and routes a network-level error to onError", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));

    await expect(renderOnDelete()()).resolves.toBe(false);
    expect(onError).toHaveBeenCalledWith(new Error("Failed to fetch"));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("resolves true when onSuccess throws (delete itself succeeded)", async () => {
    mockFetchResource.mockResolvedValue(mockResponse(200, {}));
    onSuccess.mockImplementation(() => {
      throw new Error("router error");
    });

    await withConsoleErrorHiding(async () => {
      await expect(renderOnDelete()()).resolves.toBe(true);
    });
    expect(onError).not.toHaveBeenCalled();
  });
});
