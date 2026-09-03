jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { fetchResource } from "@/app/common/utils";
import { queryFn } from "@/app/query/queryFn";
import { createMockResponse } from "@/testing/utils";
import { type QueryFunctionContext } from "@tanstack/react-query";

const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

const REQUEST_URL = "/api/x";

/**
 * Invoke the query function built by `queryFn` with a minimal context.
 * @param signal - Optional abort signal to thread through the context.
 * @returns The resolved response data.
 */
function runQueryFn<T>(signal?: AbortSignal): Promise<T> {
  const fn = queryFn<T>(REQUEST_URL, METHOD.GET);
  const context = {
    queryKey: ["x"],
    signal,
  } as unknown as QueryFunctionContext;
  return Promise.resolve(fn(context));
}

describe("queryFn", () => {
  beforeEach(() => {
    mockFetchResource.mockReset();
  });

  it("resolves to the parsed JSON on an OK response", async () => {
    const data = { id: "1", name: "test" };
    mockFetchResource.mockResolvedValue(createMockResponse(200, data));
    await expect(runQueryFn()).resolves.toEqual(data);
    expect(mockFetchResource).toHaveBeenCalledWith(
      REQUEST_URL,
      METHOD.GET,
      undefined,
      expect.objectContaining({ signal: undefined }),
    );
  });

  it("threads the abort signal through to fetchResource", async () => {
    const controller = new AbortController();
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await runQueryFn(controller.signal);
    expect(mockFetchResource).toHaveBeenCalledWith(
      REQUEST_URL,
      METHOD.GET,
      undefined,
      { signal: controller.signal },
    );
  });

  it("throws the top-level message on a { message } error body", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(404, { message: "Not found" }),
    );
    await expect(runQueryFn()).rejects.toThrow("Not found");
  });

  it("throws the joined field messages on an { errors } error body", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(400, {
        errors: { name: ["is required"], title: ["too long", "bad chars"] },
      }),
    );
    await expect(runQueryFn()).rejects.toThrow(
      "is required; too long; bad chars",
    );
  });

  it("falls back to the status when the error body has neither shape", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(500, { unexpected: true }),
    );
    await expect(runQueryFn()).rejects.toThrow("Received 500 response");
  });

  it("falls back to the status when the error body is unparseable", async () => {
    // Body omitted, so `json()` rejects: an unparseable error body.
    mockFetchResource.mockResolvedValue(createMockResponse(503));
    await expect(runQueryFn()).rejects.toThrow("Received 503 response");
  });
});
