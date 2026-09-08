import { act, render } from "@testing-library/react";
import { createElement, type FunctionComponent, useState } from "react";

// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { fetchResource } from "@/app/common/utils";
import {
  type OnSubmitFn,
  type OnSubmitOptions,
} from "@/app/hooks/UseEditFileArchived/entities";
import { useEditFileArchived } from "@/app/hooks/UseEditFileArchived/hook";
import {
  actAsync,
  renderHookWithSnackbar,
  type SnackbarActionsContextProps,
  type SnackbarHookResult,
  snackbarMessages,
  type SnackbarStateContextProps,
  useSnackbarContexts,
  withSnackbarProvider,
} from "@/testing/snackbar";
import { createMockResponse, withConsoleErrorHiding } from "@/testing/utils";

// Type mocks
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

// Test data
const TEST_PAYLOAD = { fileIds: ["test-file-id"] };
const TEST_REQUEST_URL = "/api/test-archive";

type Result = SnackbarHookResult<typeof useEditFileArchived>;

/**
 * Calls onSubmit inside act() and returns its resolved value.
 * @param result - Render result from renderHookWithSnackbar.
 * @param options - Submit options.
 * @returns promise (true on success).
 */
function submit(result: Result, options?: OnSubmitOptions): Promise<boolean> {
  return actAsync(() =>
    result.current.hook.onSubmit(TEST_REQUEST_URL, TEST_PAYLOAD, options),
  );
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
    ({ snackbar: snackbarState, snackbarActions } = useSnackbarContexts());
    return null;
  };

  const Harness: FunctionComponent = () => {
    const [mounted, setMounted] = useState(true);
    setConsumerMounted = setMounted;
    return createElement(
      withSnackbarProvider,
      null,
      mounted ? createElement(Consumer) : null,
      createElement(StateReader),
    );
  };

  render(createElement(Harness));

  return {
    openForeignError: (message: string): void => {
      act(() => {
        snackbarActions?.onOpen(message, TEST_FOREIGN_OPERATION);
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
    submit: (): Promise<boolean> =>
      actAsync(
        async () => (await onSubmit?.(TEST_REQUEST_URL, TEST_PAYLOAD)) ?? false,
      ),
  };
}

// Stands in for an unrelated feature's operation key.
const TEST_FOREIGN_OPERATION = "delete-source-study:other-study";

describe("useEditFileArchived", () => {
  let onSuccess: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    onSuccess = jest.fn();
  });

  it("PATCHes the payload to the given URL and resolves true on an OK response", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));

    const { result } = renderHookWithSnackbar(useEditFileArchived);
    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(mockFetchResource).toHaveBeenCalledWith(
      TEST_REQUEST_URL,
      METHOD.PATCH,
      TEST_PAYLOAD,
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("opens the error snackbar by default on a non-OK response", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(400, { errors: { fileIds: ["fileIds is invalid"] } }),
    );

    const { result } = renderHookWithSnackbar(useEditFileArchived);
    await expect(submit(result)).resolves.toBe(false);
    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "fileIds is invalid",
    ]);
  });

  it("opens the error snackbar by default on a network-level error", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHookWithSnackbar(useEditFileArchived);
    await expect(submit(result)).resolves.toBe(false);
    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "Failed to fetch",
    ]);
  });

  it("falls back to the status code when the error body is unparseable", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));

    const { result } = renderHookWithSnackbar(useEditFileArchived);
    await expect(submit(result)).resolves.toBe(false);
    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "Received 500 response",
    ]);
  });

  it("dismisses a stale error from a previous attempt on success", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));
    const { result } = renderHookWithSnackbar(useEditFileArchived);
    await submit(result);
    expect(snackbarMessages(result.current.snackbar)).toHaveLength(1);

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(snackbarMessages(result.current.snackbar)).toEqual([]);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("does not dismiss an error opened by another feature on success", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));

    const { result } = renderHookWithSnackbar(useEditFileArchived);
    // Simulate an unread error owned by an unrelated feature.
    act(() => {
      result.current.snackbarActions.onOpen(
        "Forbidden for this atlas",
        TEST_FOREIGN_OPERATION,
      );
    });

    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "Forbidden for this atlas",
    ]);
  });

  it("dismisses only its own stale error when another feature's is also on the stack", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));
    const { result } = renderHookWithSnackbar(useEditFileArchived);
    await submit(result);
    expect(snackbarMessages(result.current.snackbar)).toHaveLength(1);

    // Another feature raises an error alongside this hook's, before the retry
    // succeeds. Under the single slot it *replaced* this hook's; on the stack
    // both are present, and only this hook's is cleared.
    act(() => {
      result.current.snackbarActions.onOpen(
        "Unrelated error",
        TEST_FOREIGN_OPERATION,
      );
    });

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await expect(submit(result)).resolves.toBe(true);
    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "Unrelated error",
    ]);
  });

  it("dismisses this feature's stale error after the hook remounts on another page", async () => {
    const harness = renderRemountHarness();

    // Archive fails on one page.
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );
    await expect(harness.submit()).resolves.toBe(false);
    expect(snackbarMessages(harness.snackbar())).toHaveLength(1);

    // Navigating unmounts the hook; the app-level provider keeps the entry.
    await harness.remountConsumer();
    expect(snackbarMessages(harness.snackbar())).toHaveLength(1);

    // A success from the fresh instance still owns the entry, so it clears.
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await expect(harness.submit()).resolves.toBe(true);
    expect(snackbarMessages(harness.snackbar())).toEqual([]);
  });

  it("still leaves another feature's error alone after the hook remounts", async () => {
    const harness = renderRemountHarness();

    mockFetchResource.mockResolvedValue(createMockResponse(500));
    await harness.submit();
    await harness.remountConsumer();

    // An unrelated feature raises an unread error after the remount; this
    // hook's stale one is still on the stack beside it.
    harness.openForeignError("Forbidden for this atlas");

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await expect(harness.submit()).resolves.toBe(true);
    expect(snackbarMessages(harness.snackbar())).toEqual([
      "Forbidden for this atlas",
    ]);
  });

  it("reports isRequesting while in flight and resets it on success", async () => {
    let release: (() => void) | undefined;
    mockFetchResource.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = (): void => resolve(createMockResponse(200, {}));
        }),
    );

    const { result } = renderHookWithSnackbar(useEditFileArchived);
    expect(result.current.hook.isRequesting).toBe(false);

    let submitted: Promise<boolean> | undefined;
    await act(async () => {
      submitted = result.current.hook.onSubmit(TEST_REQUEST_URL, TEST_PAYLOAD);
    });
    // In flight: the button consuming this stays disabled, so the endpoint
    // can't reject a repeat click for an action that already succeeded.
    expect(result.current.hook.isRequesting).toBe(true);

    await act(async () => {
      release?.();
      await submitted;
    });
    expect(result.current.hook.isRequesting).toBe(false);
  });

  it("resets isRequesting on failure, so the button can't get stuck disabled", async () => {
    mockFetchResource.mockRejectedValue(new Error("Network error"));

    const { result } = renderHookWithSnackbar(useEditFileArchived);
    await expect(submit(result)).resolves.toBe(false);
    expect(result.current.hook.isRequesting).toBe(false);
  });

  it("resolves true when onSuccess throws (the request itself succeeded)", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    onSuccess.mockImplementation(() => {
      throw new Error("invalidate error");
    });

    const { result } = renderHookWithSnackbar(useEditFileArchived);
    await withConsoleErrorHiding(async () => {
      await expect(submit(result, { onSuccess })).resolves.toBe(true);
    });
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

    const { result } = renderHookWithSnackbar(useEditFileArchived);
    await withConsoleErrorHiding(async () => {
      await expect(submit(result, { onSuccess })).resolves.toBe(true);
    });
    expect(settled).toBe(true);
  });
});
