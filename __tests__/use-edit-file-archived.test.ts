import { act, render } from "@testing-library/react";
import { createElement, type FunctionComponent, useState } from "react";

// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { fetchResource } from "@/app/common/utils";
import { useEditFileArchived } from "@/app/hooks/UseEditFileArchived/hook";
import {
  type OnSubmitFn,
  type OnSubmitOptions,
} from "@/app/hooks/UseEditFileArchived/types";
import { mockQueryClient } from "@/testing/query";
import {
  actAsync,
  createQuerySnackbarWrapper,
  renderHookWithSnackbar,
  type SnackbarActionsContextProps,
  type SnackbarHookResult,
  snackbarMessages,
  type SnackbarStateContextProps,
  useSnackbarContexts,
} from "@/testing/snackbar";
import {
  createMockResponse,
  delay,
  isPending,
  withConsoleErrorHiding,
} from "@/testing/utils";
import { type QueryKey } from "@tanstack/react-query";

// Type mocks
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

// Test data
const TEST_AWAITED_KEY: QueryKey = ["test-detail", "test-atlas-id"];
const TEST_DISPATCHED_KEY: QueryKey = ["test-atlas", "test-atlas-id"];
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

  // Built once, outside the render: a fresh wrapper identity per render would
  // remount the consumer on every state change, which is the very thing the
  // remount tests below control deliberately.
  const Providers = createQuerySnackbarWrapper();

  const Harness: FunctionComponent = () => {
    const [mounted, setMounted] = useState(true);
    setConsumerMounted = setMounted;
    return createElement(
      Providers,
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

  // The mechanism lives in the request layer (`onRequestSuccess`), shared with
  // every other request hook; what is pinned here is that this hook forwards
  // the declaration intact, observed end to end through its own `onSubmit`.
  describe("invalidateQueryKeys", () => {
    it("stays pending until the awaited invalidations settle, and no longer", async () => {
      // The declared window, performed by the hook rather than by whatever a
      // call site remembered to return: the control stays disabled until the
      // awaited refetch lands, so it can't be clicked against stale state.
      //
      // The awaited key is resolved *alone*, leaving the dispatched one
      // pending. An implementation awaiting both is still waiting at that
      // point, so it fails the second assertion. Resolving the dispatched key
      // first instead would pass either way — which is no test at all.
      mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
      const { queryClient, resolve } = mockQueryClient();
      const { result } = renderHookWithSnackbar(
        useEditFileArchived,
        queryClient,
      );

      let submitted: Promise<boolean> | undefined;
      await act(async () => {
        submitted = result.current.hook.onSubmit(
          TEST_REQUEST_URL,
          TEST_PAYLOAD,
          {
            invalidateQueryKeys: {
              awaited: [TEST_AWAITED_KEY],
              dispatched: [TEST_DISPATCHED_KEY],
            },
          },
        );
      });

      expect(await isPending(submitted)).toBe(true);

      await act(async () => {
        resolve(TEST_AWAITED_KEY);
      });
      expect(await isPending(submitted)).toBe(false);
      await expect(submitted).resolves.toBe(true);
    });

    it("invalidates the dispatched keys too, without waiting for them", async () => {
      // The other half of the contract: narrowing what is *awaited* must not
      // narrow what is invalidated. Dropping the dispatched calls would shorten
      // the window just as well and silently leave those caches stale.
      mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
      const { invalidatedKeys, queryClient, resolve } = mockQueryClient();
      const { result } = renderHookWithSnackbar(
        useEditFileArchived,
        queryClient,
      );

      let submitted: Promise<boolean> | undefined;
      await act(async () => {
        submitted = result.current.hook.onSubmit(
          TEST_REQUEST_URL,
          TEST_PAYLOAD,
          {
            invalidateQueryKeys: {
              awaited: [TEST_AWAITED_KEY],
              dispatched: [TEST_DISPATCHED_KEY],
            },
          },
        );
      });
      await act(async () => {
        resolve(TEST_AWAITED_KEY);
        await submitted;
      });

      // The dispatched key is never resolved, so reaching this line at all is
      // the proof it wasn't awaited. It is dispatched first so it can't cancel
      // the awaited refetch.
      expect(invalidatedKeys()).toEqual([
        TEST_DISPATCHED_KEY,
        TEST_AWAITED_KEY,
      ]);
    });

    it("dispatches the invalidations before onSuccess runs", async () => {
      // The side effect and the cache declaration are independent in timing as
      // well as outcome: a slow or async `onSuccess` must not hold the declared
      // refetches back, so every key is already in flight when it is called.
      //
      // Recorded into a local rather than asserted inside the mock: a failing
      // `expect` in there throws inside the guarded callback, is logged by the
      // request layer, and the submit still resolves `true` — the test would
      // stay green for exactly the regression it pins.
      mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
      const { invalidatedKeys, queryClient, resolve } = mockQueryClient();
      let invalidatedBeforeSideEffect: number | undefined;
      onSuccess.mockImplementation(() => {
        invalidatedBeforeSideEffect = invalidatedKeys().length;
      });
      const { result } = renderHookWithSnackbar(
        useEditFileArchived,
        queryClient,
      );

      let submitted: Promise<boolean> | undefined;
      await act(async () => {
        submitted = result.current.hook.onSubmit(
          TEST_REQUEST_URL,
          TEST_PAYLOAD,
          { invalidateQueryKeys: { awaited: [TEST_AWAITED_KEY] }, onSuccess },
        );
      });
      await act(async () => {
        resolve(TEST_AWAITED_KEY);
        await submitted;
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(invalidatedBeforeSideEffect).toBe(1);
    });

    it("still invalidates the declared keys when onSuccess throws", async () => {
      // The side effect and the cache declaration are independent by design. A
      // throwing `resetRowSelection` leaving the list caches stale — until a
      // manual refresh — is exactly what declaring the keys is meant to rule
      // out, so the invalidations can't sit behind it.
      mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
      const { invalidatedKeys, queryClient, resolve } = mockQueryClient();
      onSuccess.mockImplementation(() => {
        throw new Error("side effect error");
      });
      const { result } = renderHookWithSnackbar(
        useEditFileArchived,
        queryClient,
      );

      await withConsoleErrorHiding(async () => {
        let submitted: Promise<boolean> | undefined;
        await act(async () => {
          submitted = result.current.hook.onSubmit(
            TEST_REQUEST_URL,
            TEST_PAYLOAD,
            {
              invalidateQueryKeys: { awaited: [TEST_AWAITED_KEY] },
              onSuccess,
            },
          );
        });
        await act(async () => {
          resolve(TEST_AWAITED_KEY);
          await expect(submitted).resolves.toBe(true);
        });
      });

      expect(invalidatedKeys()).toEqual([TEST_AWAITED_KEY]);
    });

    it("logs a rejection from an async onSuccess and still invalidates", async () => {
      // `() => void` still accepts an async function — TypeScript's void-return
      // bivariance lets one through — so a rejection from one is handled the
      // same way as a synchronous throw: logged, with the declared caches
      // invalidated regardless.
      mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
      const { invalidatedKeys, queryClient, resolve } = mockQueryClient();
      const rejection = new Error("async side effect error");
      onSuccess.mockImplementation(async () => {
        await delay();
        throw rejection;
      });
      const { result } = renderHookWithSnackbar(
        useEditFileArchived,
        queryClient,
      );

      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      let submitted: Promise<boolean> | undefined;
      await act(async () => {
        submitted = result.current.hook.onSubmit(
          TEST_REQUEST_URL,
          TEST_PAYLOAD,
          { invalidateQueryKeys: { awaited: [TEST_AWAITED_KEY] }, onSuccess },
        );
      });
      // Already dispatched: the rejection still hasn't landed at this point.
      expect(invalidatedKeys()).toEqual([TEST_AWAITED_KEY]);
      await act(async () => {
        resolve(TEST_AWAITED_KEY);
        await expect(submitted).resolves.toBe(true);
      });

      expect(consoleError).toHaveBeenCalledWith(rejection);
      expect(invalidatedKeys()).toEqual([TEST_AWAITED_KEY]);
      consoleError.mockRestore();
    });

    it("invalidates nothing when no keys are declared", async () => {
      // Both lists are optional, and the request layer's defaults are the only
      // thing between an omitted option and a throw on iteration.
      mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
      const { invalidatedKeys, queryClient } = mockQueryClient();
      const { result } = renderHookWithSnackbar(
        useEditFileArchived,
        queryClient,
      );

      await expect(submit(result, { onSuccess })).resolves.toBe(true);

      expect(invalidatedKeys()).toEqual([]);
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
