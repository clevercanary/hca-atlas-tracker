jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { fetchResource } from "@/app/common/utils";
import { queryFn } from "@/app/query/queryFn";
import { type QueryFunctionContext } from "@tanstack/react-query";

const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

const REQUEST_URL = "/api/x";

/**
 * Resolve `fetchResource` with a response of the given status and JSON body.
 * @param status - Response status code.
 * @param body - JSON body (or a thrower to simulate an unparseable body).
 * @returns void.
 */
function mockResponse(status: number, body: unknown): void {
  mockFetchResource.mockResolvedValue({
    json: async () => {
      if (typeof body === "function") return body();
      return body;
    },
    status,
  } as Response);
}

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
    mockResponse(200, data);
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
    mockResponse(200, {});
    await runQueryFn(controller.signal);
    expect(mockFetchResource).toHaveBeenCalledWith(
      REQUEST_URL,
      METHOD.GET,
      undefined,
      { signal: controller.signal },
    );
  });

  it("throws the top-level message on a { message } error body", async () => {
    mockResponse(404, { message: "Not found" });
    await expect(runQueryFn()).rejects.toThrow("Not found");
  });

  it("throws the joined field messages on an { errors } error body", async () => {
    mockResponse(400, {
      errors: { name: ["is required"], title: ["too long", "bad chars"] },
    });
    await expect(runQueryFn()).rejects.toThrow(
      "is required; too long; bad chars",
    );
  });

  it("falls back to the status when the error body has neither shape", async () => {
    mockResponse(500, { unexpected: true });
    await expect(runQueryFn()).rejects.toThrow("Received 500 response");
  });

  it("falls back to the status when the error body is unparseable", async () => {
    mockResponse(503, () => {
      throw new Error("invalid json");
    });
    await expect(runQueryFn()).rejects.toThrow("Received 503 response");
  });
});
