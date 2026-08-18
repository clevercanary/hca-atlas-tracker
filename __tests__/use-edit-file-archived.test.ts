import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import {
  createElement,
  type FunctionComponent,
  type PropsWithChildren,
} from "react";

// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { fetchResource } from "@/app/common/utils";
import { useSnackbarState } from "@/app/components/common/Snackbar/provider/hook";
import { SnackbarProvider } from "@/app/components/common/Snackbar/provider/provider";
import { type SnackbarStateContextProps } from "@/app/components/common/Snackbar/provider/types";
import { type OnSubmitOptions } from "@/app/hooks/UseEditFileArchived/entities";
import { useEditFileArchived } from "@/app/hooks/UseEditFileArchived/hook";
import { createMockResponse, withConsoleErrorHiding } from "@/testing/utils";

// Type mocks
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

// Test data
const TEST_PAYLOAD = { fileIds: ["test-file-id"] };
const TEST_REQUEST_URL = "/api/test-archive";

interface RenderedHooks {
  edit: ReturnType<typeof useEditFileArchived>;
  snackbar: SnackbarStateContextProps;
}

const wrapper: FunctionComponent<PropsWithChildren> = ({ children }) =>
  createElement(SnackbarProvider, null, children);

/**
 * Renders the hook under test together with the snackbar state (both under a
 * SnackbarProvider) so tests can observe the default error handling.
 * @returns render result exposing the hook and the snackbar state.
 */
function renderUseEditFileArchived(): RenderHookResult<RenderedHooks, unknown> {
  return renderHook(
    () => ({
      edit: useEditFileArchived(),
      snackbar: useSnackbarState(),
    }),
    { wrapper },
  );
}

/**
 * Calls onSubmit inside act() (it updates snackbar state) and returns its
 * resolved value.
 * @param result - Render result from renderUseEditFileArchived.
 * @param options - Submit options.
 * @returns promise (true on success).
 */
async function submit(
  result: RenderHookResult<RenderedHooks, unknown>["result"],
  options?: OnSubmitOptions,
): Promise<boolean> {
  let submitted = false;
  await act(async () => {
    submitted = await result.current.edit.onSubmit(
      TEST_REQUEST_URL,
      TEST_PAYLOAD,
      options,
    );
  });
  return submitted;
}

describe("useEditFileArchived", () => {
  let onError: jest.Mock;
  let onSuccess: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    onError = jest.fn();
    onSuccess = jest.fn();
  });

  it("PATCHes the payload to the given URL and resolves true on an OK response", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));

    const { result } = renderUseEditFileArchived();
    await expect(submit(result, { onError, onSuccess })).resolves.toBe(true);
    expect(mockFetchResource).toHaveBeenCalledWith(
      TEST_REQUEST_URL,
      METHOD.PATCH,
      TEST_PAYLOAD,
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("resolves false and routes the API message to an onError override on a non-OK response", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );

    const { result } = renderUseEditFileArchived();
    await expect(submit(result, { onError, onSuccess })).resolves.toBe(false);
    expect(onError).toHaveBeenCalledWith(new Error("Forbidden for this atlas"));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.snackbar.open).toBe(false);
  });

  it("opens the error snackbar by default on a non-OK response", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(400, { errors: { fileIds: ["fileIds is invalid"] } }),
    );

    const { result } = renderUseEditFileArchived();
    await expect(submit(result)).resolves.toBe(false);
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("fileIds is invalid");
  });

  it("opens the error snackbar by default on a network-level error", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderUseEditFileArchived();
    await expect(submit(result)).resolves.toBe(false);
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("Failed to fetch");
  });

  it("falls back to the status code when the error body is unparseable", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));

    const { result } = renderUseEditFileArchived();
    await expect(submit(result)).resolves.toBe(false);
    expect(result.current.snackbar.message).toBe("Received 500 response");
  });

  it("dismisses a stale error from a previous attempt on success", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));
    const { result } = renderUseEditFileArchived();
    await submit(result);
    expect(result.current.snackbar.open).toBe(true);

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(result.current.snackbar.open).toBe(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("resolves true when onSuccess throws (the request itself succeeded)", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    onSuccess.mockImplementation(() => {
      throw new Error("invalidate error");
    });

    const { result } = renderUseEditFileArchived();
    await withConsoleErrorHiding(async () => {
      await expect(submit(result, { onError, onSuccess })).resolves.toBe(true);
    });
    expect(onError).not.toHaveBeenCalled();
  });
});
