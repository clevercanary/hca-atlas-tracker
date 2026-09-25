jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { performRequest } from "@/app/common/requests";
import { fetchResource } from "@/app/common/utils";
import {
  createMockResponse,
  isPending,
  withConsoleErrorHiding,
} from "@/testing/utils";

const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

const TEST_BODY = { id: "created-id" };
const TEST_REQUEST_URL = "/api/test";

describe("performRequest", () => {
  let onError: jest.Mock;
  let onSuccess: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    onError = jest.fn();
    onSuccess = jest.fn();
  });

  it("passes the parsed body to onSuccess and resolves true", async () => {
    const res = createMockResponse(200, TEST_BODY);
    mockFetchResource.mockResolvedValue(res);

    await expect(
      performRequest(TEST_REQUEST_URL, METHOD.POST, undefined, {
        onError,
        onSuccess,
        parseBody: (res) => res.json(),
      }),
    ).resolves.toBe(true);
    expect(onSuccess).toHaveBeenCalledWith(TEST_BODY);
    expect(onError).not.toHaveBeenCalled();
  });

  it("calls onSuccess with no body when no parser is given", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200));

    await expect(
      performRequest(TEST_REQUEST_URL, METHOD.POST, undefined, {
        onError,
        onSuccess,
      }),
    ).resolves.toBe(true);
    expect(onSuccess).toHaveBeenCalledWith();
  });

  it("does not type a body onSuccess can't be given", () => {
    // Type-level only: a callback that takes a body needs a parser to supply
    // it, or it would be handed `undefined` at runtime.
    const options: Parameters<typeof performRequest>[3] = {
      onError,
      // @ts-expect-error -- takes a body but no parseBody supplies one.
      onSuccess: (body: { id: string }): string => body.id,
    };
    expect(options).toBeDefined();
  });

  it("routes a parse failure on a success status to onError and resolves false (#1550)", async () => {
    // createMockResponse rejects json() when given no body.
    mockFetchResource.mockResolvedValue(createMockResponse(201));

    await expect(
      performRequest(TEST_REQUEST_URL, METHOD.POST, undefined, {
        isSuccessStatus: (status) => status === 201,
        onError,
        onSuccess,
        parseBody: (res) => res.json(),
      }),
    ).resolves.toBe(false);
    expect(onError).toHaveBeenCalledWith(new Error("no body"));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("runs onCommitted before the body is parsed, and awaits it even when parsing fails", async () => {
    // A success status means the mutation has taken effect, so what it needs
    // (the hooks' cache invalidations) can't wait on, or be skipped by, a body
    // that turns out to be unreadable.
    mockFetchResource.mockResolvedValue(createMockResponse(201));
    const calls: string[] = [];
    let finishCommitted: () => void = () => undefined;
    const onCommitted = jest.fn(() => {
      calls.push("committed");
      return new Promise<void>((resolve) => {
        finishCommitted = resolve;
      });
    });

    const requested = performRequest(TEST_REQUEST_URL, METHOD.POST, undefined, {
      isSuccessStatus: (status) => status === 201,
      onCommitted,
      onError: (error) => calls.push(`error: ${error.message}`),
      onSuccess,
      parseBody: async (res) => {
        calls.push("parse");
        return res.json();
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(calls).toEqual(["committed", "parse", "error: no body"]);
    // Still held open by the committed work.
    expect(await isPending(requested)).toBe(true);

    finishCommitted();
    await expect(requested).resolves.toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("does not run onCommitted when the request fails", async () => {
    const onCommitted = jest.fn();
    mockFetchResource.mockResolvedValueOnce(createMockResponse(500));
    mockFetchResource.mockRejectedValueOnce(new Error("Failed to fetch"));

    for (let i = 0; i < 2; i++) {
      await expect(
        performRequest(TEST_REQUEST_URL, METHOD.POST, undefined, {
          onCommitted,
          onError,
        }),
      ).resolves.toBe(false);
    }
    expect(onCommitted).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(2);
  });

  it("resolves true and only logs when onCommitted throws", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200));

    const errors: unknown[][] = [];
    await withConsoleErrorHiding(
      async () => {
        await expect(
          performRequest(TEST_REQUEST_URL, METHOD.POST, undefined, {
            onCommitted: () => {
              throw new Error("commit error");
            },
            onError,
            onSuccess,
          }),
        ).resolves.toBe(true);
      },
      true,
      errors,
    );
    expect(onSuccess).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(errors).toEqual([[new Error("commit error")]]);
  });

  it("does not parse the body of a non-success response", async () => {
    const parseBody = jest.fn();
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden" }),
    );

    await expect(
      performRequest(TEST_REQUEST_URL, METHOD.POST, undefined, {
        onError,
        onSuccess,
        parseBody,
      }),
    ).resolves.toBe(false);
    expect(parseBody).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(new Error("Forbidden"));
  });

  it("resolves true and only logs when onSuccess throws (the request itself succeeded)", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, TEST_BODY));
    onSuccess.mockImplementation(() => {
      // Stands in for a navigation side effect such as location.assign.
      throw new Error("navigation error");
    });

    const errors: unknown[][] = [];
    await withConsoleErrorHiding(
      async () => {
        await expect(
          performRequest(TEST_REQUEST_URL, METHOD.POST, undefined, {
            onError,
            onSuccess,
            parseBody: (res) => res.json(),
          }),
        ).resolves.toBe(true);
      },
      true,
      errors,
    );
    expect(onError).not.toHaveBeenCalled();
    expect(errors).toEqual([[new Error("navigation error")]]);
  });
});
