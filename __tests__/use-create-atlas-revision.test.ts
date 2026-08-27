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
import { type OnSubmitOptions } from "@/app/hooks/UseCreateAtlasRevision/entities";
import { useCreateAtlasRevision } from "@/app/hooks/UseCreateAtlasRevision/hook";
import { createMockResponse, withConsoleErrorHiding } from "@/testing/utils";

// Type mocks
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

// Test data
const TEST_ATLAS = { id: "new-atlas-id" };
const TEST_REQUEST_URL = "/api/test-atlas-versions";

interface RenderedHooks {
  revision: ReturnType<typeof useCreateAtlasRevision>;
  snackbar: SnackbarStateContextProps;
}

const wrapper: FunctionComponent<PropsWithChildren> = ({ children }) =>
  createElement(SnackbarProvider, null, children);

/**
 * Renders the hook under test together with the snackbar state (both under a
 * SnackbarProvider) so tests can observe the default error handling.
 * @returns render result exposing the hook and the snackbar state.
 */
function renderUseCreateAtlasRevision(): RenderHookResult<
  RenderedHooks,
  unknown
> {
  return renderHook(
    () => ({
      revision: useCreateAtlasRevision(),
      snackbar: useSnackbarState(),
    }),
    { wrapper },
  );
}

/**
 * Calls onSubmit inside act() (it updates hook and snackbar state) and returns
 * its resolved value.
 * @param result - Render result from renderUseCreateAtlasRevision.
 * @param options - Submit options.
 * @returns promise (true on success).
 */
async function submit(
  result: RenderHookResult<RenderedHooks, unknown>["result"],
  options?: OnSubmitOptions,
): Promise<boolean> {
  let submitted = false;
  await act(async () => {
    submitted = await result.current.revision.onSubmit(
      TEST_REQUEST_URL,
      options,
    );
  });
  return submitted;
}

describe("useCreateAtlasRevision", () => {
  let onSuccess: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    onSuccess = jest.fn();
  });

  it("POSTs to the given URL and passes the created atlas to onSuccess on 201", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(201, TEST_ATLAS));

    const { result } = renderUseCreateAtlasRevision();
    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(mockFetchResource).toHaveBeenCalledWith(
      TEST_REQUEST_URL,
      METHOD.POST,
      undefined,
    );
    expect(onSuccess).toHaveBeenCalledWith(TEST_ATLAS);
    expect(result.current.revision.succeeded).toBe(true);
    expect(result.current.revision.isRequesting).toBe(false);
    expect(result.current.snackbar.open).toBe(false);
  });

  it("treats a 200 as a failure (the endpoint answers 201)", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(200, { message: "Unexpected" }),
    );

    const { result } = renderUseCreateAtlasRevision();
    await expect(submit(result, { onSuccess })).resolves.toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("opens the error snackbar and resolves false on a non-201 response", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );

    const { result } = renderUseCreateAtlasRevision();
    await expect(submit(result, { onSuccess })).resolves.toBe(false);
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("Forbidden for this atlas");
    expect(onSuccess).not.toHaveBeenCalled();
    // Not thrown to the error boundary, and the dialog's buttons are usable
    // again rather than stuck disabled.
    expect(result.current.revision.succeeded).toBe(false);
    expect(result.current.revision.isRequesting).toBe(false);
  });

  it("opens the error snackbar and resolves false on a network-level error", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderUseCreateAtlasRevision();
    await expect(submit(result, { onSuccess })).resolves.toBe(false);
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("Failed to fetch");
    expect(result.current.revision.isRequesting).toBe(false);
  });

  it("dismisses a stale error from a previous attempt on success", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));
    const { result } = renderUseCreateAtlasRevision();
    await submit(result);
    expect(result.current.snackbar.open).toBe(true);

    mockFetchResource.mockResolvedValue(createMockResponse(201, TEST_ATLAS));
    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(result.current.snackbar.open).toBe(false);
  });

  it("resolves true when onSuccess throws (the request itself succeeded)", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(201, TEST_ATLAS));
    onSuccess.mockImplementation(() => {
      // Stands in for the location.assign navigation the dialog performs.
      throw new Error("navigation error");
    });

    const { result } = renderUseCreateAtlasRevision();
    await withConsoleErrorHiding(async () => {
      await expect(submit(result, { onSuccess })).resolves.toBe(true);
    });
    expect(result.current.revision.succeeded).toBe(true);
  });
});
