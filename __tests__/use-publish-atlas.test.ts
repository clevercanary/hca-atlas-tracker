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
import { type OnSubmitOptions } from "@/app/hooks/UsePublishAtlas/entities";
import { usePublishAtlas } from "@/app/hooks/UsePublishAtlas/hook";
import { createMockResponse } from "@/testing/utils";

// Type mocks
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

// Test data
const TEST_REQUEST_URL = "/api/test-publish";

interface RenderedHooks {
  publish: ReturnType<typeof usePublishAtlas>;
  snackbar: SnackbarStateContextProps;
}

const wrapper: FunctionComponent<PropsWithChildren> = ({ children }) =>
  createElement(SnackbarProvider, null, children);

/**
 * Renders the hook under test together with the snackbar state (both under a
 * SnackbarProvider) so tests can observe the default error handling.
 * @returns render result exposing the hook and the snackbar state.
 */
function renderUsePublishAtlas(): RenderHookResult<RenderedHooks, unknown> {
  return renderHook(
    () => ({
      publish: usePublishAtlas(),
      snackbar: useSnackbarState(),
    }),
    { wrapper },
  );
}

/**
 * Calls onSubmit inside act() (it updates hook and snackbar state) and
 * returns its resolved value.
 * @param result - Render result from renderUsePublishAtlas.
 * @param options - Submit options.
 * @returns promise (true on success).
 */
async function submit(
  result: RenderHookResult<RenderedHooks, unknown>["result"],
  options?: OnSubmitOptions,
): Promise<boolean> {
  let submitted = false;
  await act(async () => {
    submitted = await result.current.publish.onSubmit(
      TEST_REQUEST_URL,
      options,
    );
  });
  return submitted;
}

describe("usePublishAtlas", () => {
  let onSuccess: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    onSuccess = jest.fn();
  });

  it("POSTs to the given URL and resolves true on an OK response", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));

    const { result } = renderUsePublishAtlas();
    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(mockFetchResource).toHaveBeenCalledWith(
      TEST_REQUEST_URL,
      METHOD.POST,
      undefined,
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.publish.isRequesting).toBe(false);
  });

  it("opens the error snackbar and resets isRequesting on a non-OK response", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );

    const { result } = renderUsePublishAtlas();
    await expect(submit(result, { onSuccess })).resolves.toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("Forbidden for this atlas");
    // The dialog buttons are disabled on isRequesting, so a failure must
    // reset it or the dialog is permanently dead.
    expect(result.current.publish.isRequesting).toBe(false);
  });

  it("opens the error snackbar and resets isRequesting on a network-level error", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderUsePublishAtlas();
    await expect(submit(result, { onSuccess })).resolves.toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("Failed to fetch");
    expect(result.current.publish.isRequesting).toBe(false);
  });

  it("dismisses a stale error from a previous attempt on success", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));
    const { result } = renderUsePublishAtlas();
    await submit(result);
    expect(result.current.snackbar.open).toBe(true);

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(result.current.snackbar.open).toBe(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
