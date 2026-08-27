import {
  act,
  render,
  renderHook,
  type RenderHookResult,
} from "@testing-library/react";
import {
  createElement,
  type FunctionComponent,
  type PropsWithChildren,
  useState,
} from "react";

// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { fetchResource } from "@/app/common/utils";
import {
  useSnackbar,
  useSnackbarState,
} from "@/app/components/common/Snackbar/provider/hook";
import { SnackbarProvider } from "@/app/components/common/Snackbar/provider/provider";
import {
  type SnackbarActionsContextProps,
  type SnackbarStateContextProps,
} from "@/app/components/common/Snackbar/provider/types";
import { SNACKBAR_SCOPE } from "@/app/components/common/Snackbar/types";
import {
  type OnSubmitFn,
  type OnSubmitOptions,
} from "@/app/hooks/UseEditFileArchived/entities";
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
  snackbarActions: SnackbarActionsContextProps;
}

const wrapper: FunctionComponent<PropsWithChildren> = ({ children }) =>
  createElement(SnackbarProvider, null, children);

/**
 * Renders the hook under test together with the snackbar state and actions
 * (all under a SnackbarProvider) so tests can observe the default error
 * handling and simulate errors opened by other features.
 * @returns render result exposing the hook and the snackbar state/actions.
 */
function renderUseEditFileArchived(): RenderHookResult<RenderedHooks, unknown> {
  return renderHook(
    () => ({
      edit: useEditFileArchived(),
      snackbar: useSnackbarState(),
      snackbarActions: useSnackbar(),
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

interface RemountHarness {
  // Opens a message owned by an unrelated feature.
  openForeignError: (message: string) => void;
  // Unmounts the hook's consumer and mounts a fresh one, leaving the
  // app-level provider (and any open message) in place.
  remountConsumer: () => Promise<void>;
  snackbar: () => SnackbarStateContextProps;
  submit: () => Promise<boolean>;
}

/**
 * Renders the hook under test inside a SnackbarProvider whose consumer can be
 * unmounted and remounted, simulating client-side navigation: the provider is
 * mounted in `_app`, so it outlives the page, while the page's hook instance
 * does not.
 * @returns handles to submit, remount the consumer, and read snackbar state.
 */
function renderRemountHarness(): RemountHarness {
  let onSubmit: OnSubmitFn | undefined;
  let snackbarState: SnackbarStateContextProps | undefined;
  let snackbarActions: SnackbarActionsContextProps | undefined;
  let setConsumerMounted: ((mounted: boolean) => void) | undefined;

  const Consumer: FunctionComponent = () => {
    ({ onSubmit } = useEditFileArchived());
    return null;
  };

  const StateReader: FunctionComponent = () => {
    snackbarState = useSnackbarState();
    snackbarActions = useSnackbar();
    return null;
  };

  const Harness: FunctionComponent = () => {
    const [mounted, setMounted] = useState(true);
    setConsumerMounted = setMounted;
    return createElement(
      SnackbarProvider,
      null,
      mounted ? createElement(Consumer) : null,
      createElement(StateReader),
    );
  };

  render(createElement(Harness));

  return {
    openForeignError: (message: string): void => {
      act(() => {
        snackbarActions?.onOpen(message, SNACKBAR_SCOPE.DELETE_SOURCE_STUDY);
      });
    },
    remountConsumer: async (): Promise<void> => {
      await act(async () => setConsumerMounted?.(false));
      await act(async () => setConsumerMounted?.(true));
    },
    snackbar: (): SnackbarStateContextProps => {
      if (!snackbarState) throw new Error("snackbar state not rendered");
      return snackbarState;
    },
    submit: async (): Promise<boolean> => {
      let submitted = false;
      await act(async () => {
        submitted = (await onSubmit?.(TEST_REQUEST_URL, TEST_PAYLOAD)) ?? false;
      });
      return submitted;
    },
  };
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

  it("does not dismiss an error opened by another feature on success", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));

    const { result } = renderUseEditFileArchived();
    // Simulate an unread error owned by an unrelated feature.
    act(() => {
      result.current.snackbarActions.onOpen(
        "Forbidden for this atlas",
        SNACKBAR_SCOPE.DELETE_SOURCE_STUDY,
      );
    });

    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("Forbidden for this atlas");
  });

  it("does not dismiss this hook's stale error once another feature's error replaces it", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));
    const { result } = renderUseEditFileArchived();
    await submit(result);
    expect(result.current.snackbar.open).toBe(true);

    // Another feature's error replaces this hook's before the retry succeeds.
    act(() => {
      result.current.snackbarActions.onOpen(
        "Unrelated error",
        SNACKBAR_SCOPE.DELETE_SOURCE_STUDY,
      );
    });

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await expect(submit(result)).resolves.toBe(true);
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("Unrelated error");
  });

  it("leaves the snackbar untouched on success when onError is overridden", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));

    const { result } = renderUseEditFileArchived();
    act(() => {
      result.current.snackbarActions.onOpen(
        "Unrelated error",
        SNACKBAR_SCOPE.DELETE_SOURCE_STUDY,
      );
    });

    await expect(submit(result, { onError, onSuccess })).resolves.toBe(true);
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("Unrelated error");
  });

  it("dismisses this feature's stale error after the hook remounts on another page", async () => {
    const harness = renderRemountHarness();

    // Archive fails on one page.
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );
    await expect(harness.submit()).resolves.toBe(false);
    expect(harness.snackbar().open).toBe(true);

    // Navigating unmounts the hook; the app-level provider keeps the message.
    await harness.remountConsumer();
    expect(harness.snackbar().open).toBe(true);

    // A success from the fresh instance still owns the message, so it clears.
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await expect(harness.submit()).resolves.toBe(true);
    expect(harness.snackbar().open).toBe(false);
  });

  it("still leaves another feature's error alone after the hook remounts", async () => {
    const harness = renderRemountHarness();

    mockFetchResource.mockResolvedValue(createMockResponse(500));
    await harness.submit();
    await harness.remountConsumer();

    // An unrelated feature's unread error replaces this one after the remount.
    harness.openForeignError("Forbidden for this atlas");

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await expect(harness.submit()).resolves.toBe(true);
    expect(harness.snackbar().open).toBe(true);
    expect(harness.snackbar().message).toBe("Forbidden for this atlas");
  });

  it("resolves false when an onError override throws (never-rejects contract)", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );
    onError.mockImplementation(() => {
      throw new Error("handler error");
    });

    const { result } = renderUseEditFileArchived();
    await withConsoleErrorHiding(async () => {
      await expect(submit(result, { onError, onSuccess })).resolves.toBe(false);
    });
    expect(onSuccess).not.toHaveBeenCalled();
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

  it("awaits an async onSuccess and resolves true when it rejects (the request itself succeeded)", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    let settled = false;
    onSuccess.mockImplementation(async () => {
      // Yield a microtask so resolution order proves onSuccess was awaited.
      await Promise.resolve();
      settled = true;
      throw new Error("refetch error");
    });

    const { result } = renderUseEditFileArchived();
    await withConsoleErrorHiding(async () => {
      await expect(submit(result, { onError, onSuccess })).resolves.toBe(true);
    });
    expect(settled).toBe(true);
    expect(onError).not.toHaveBeenCalled();
  });
});
