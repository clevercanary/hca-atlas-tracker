import { act, render } from "@testing-library/react";
import { createElement, type FunctionComponent, useState } from "react";

// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { fetchResource } from "@/app/common/utils";
import { SNACKBAR_SCOPE } from "@/app/components/common/Snackbar/types";
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
    submit: (): Promise<boolean> =>
      actAsync(
        async () => (await onSubmit?.(TEST_REQUEST_URL, TEST_PAYLOAD)) ?? false,
      ),
  };
}

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
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("fileIds is invalid");
  });

  it("opens the error snackbar by default on a network-level error", async () => {
    mockFetchResource.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHookWithSnackbar(useEditFileArchived);
    await expect(submit(result)).resolves.toBe(false);
    expect(result.current.snackbar.open).toBe(true);
    expect(result.current.snackbar.message).toBe("Failed to fetch");
  });

  it("falls back to the status code when the error body is unparseable", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));

    const { result } = renderHookWithSnackbar(useEditFileArchived);
    await expect(submit(result)).resolves.toBe(false);
    expect(result.current.snackbar.message).toBe("Received 500 response");
  });

  it("dismisses a stale error from a previous attempt on success", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(500));
    const { result } = renderHookWithSnackbar(useEditFileArchived);
    await submit(result);
    expect(result.current.snackbar.open).toBe(true);

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await expect(submit(result, { onSuccess })).resolves.toBe(true);
    expect(result.current.snackbar.open).toBe(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("does not dismiss an error opened by another feature on success", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));

    const { result } = renderHookWithSnackbar(useEditFileArchived);
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
    const { result } = renderHookWithSnackbar(useEditFileArchived);
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
