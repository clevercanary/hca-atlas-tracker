jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { performRequest } from "@/app/common/requests";
import { fetchResource } from "@/app/common/utils";
import { createMockResponse, withConsoleErrorHiding } from "@/testing/utils";

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
    expect(onSuccess).toHaveBeenCalledWith(res, TEST_BODY);
    expect(onError).not.toHaveBeenCalled();
  });

  it("passes undefined as the body to onSuccess when no parser is given", async () => {
    const res = createMockResponse(200);
    mockFetchResource.mockResolvedValue(res);

    await expect(
      performRequest(TEST_REQUEST_URL, METHOD.POST, undefined, {
        onError,
        onSuccess,
      }),
    ).resolves.toBe(true);
    expect(onSuccess).toHaveBeenCalledWith(res, undefined);
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
