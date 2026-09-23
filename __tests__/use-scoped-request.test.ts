// Mock dependencies before imports
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { METHOD } from "@/app/common/entities";
import { fetchResource } from "@/app/common/utils";
import { useScopedRequest } from "@/app/hooks/UseScopedRequest/hook";
import { getOperationKey } from "@/app/hooks/UseScopedRequest/utils";
import { mockQueryClient } from "@/testing/query";
import {
  actAsync,
  renderHookWithSnackbar,
  snackbarMessages,
} from "@/testing/snackbar";
import { createMockResponse, isPending } from "@/testing/utils";
import { act } from "@testing-library/react";

// Type mocks
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

// Test data — the unlink case: one URL, two rows differing only in the payload.
const UNLINK_URL = "/api/atlases/a/component-atlases/c/source-datasets";
const ROW_A = { sourceDatasetIds: ["row-a"] };
const ROW_B = { sourceDatasetIds: ["row-b"] };

describe("getOperationKey", () => {
  it("separates two rows posting the same URL with different payloads", () => {
    // The reason the payload is in the key at all. Every unlink row hits one
    // URL, so a key built from the URL alone cannot tell them apart — which is
    // exactly how a success on one row came to dismiss another's error.
    expect(getOperationKey(METHOD.DELETE, UNLINK_URL, ROW_A)).not.toBe(
      getOperationKey(METHOD.DELETE, UNLINK_URL, ROW_B),
    );
  });

  it("separates the same operation shape on two different entities", () => {
    // Deleting a source study carries its target in the URL rather than a
    // payload; a failure pinned against one study must not be cleared by
    // deleting the next.
    expect(
      getOperationKey(
        METHOD.DELETE,
        "/api/atlases/a/source-studies/s1",
        undefined,
      ),
    ).not.toBe(
      getOperationKey(
        METHOD.DELETE,
        "/api/atlases/a/source-studies/s2",
        undefined,
      ),
    );
  });

  it("matches a repeat of the same operation", () => {
    // The half that makes retry work: the same request twice is one operation,
    // so its second attempt succeeding clears what its first attempt raised.
    expect(getOperationKey(METHOD.DELETE, UNLINK_URL, ROW_A)).toBe(
      getOperationKey(METHOD.DELETE, UNLINK_URL, { ...ROW_A }),
    );
  });
});

describe("useScopedRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("raises the failure message on the stack", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, { message: "Forbidden for this atlas" }),
    );

    const { result } = renderHookWithSnackbar(() => useScopedRequest());
    await expect(
      actAsync(() =>
        result.current.hook.actions.onRequest(UNLINK_URL, METHOD.DELETE, ROW_A),
      ),
    ).resolves.toBe(false);

    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "Forbidden for this atlas",
    ]);
  });

  it("does not let one row's success dismiss another row's unread failure", async () => {
    // #1564, end to end through the real hook and provider. Row A fails; row B
    // — a concurrent operation of the same feature, under the same scope —
    // succeeds; A's error is the user's only signal that A failed.
    const { result } = renderHookWithSnackbar(() => useScopedRequest());

    mockFetchResource.mockResolvedValue(createMockResponse(500));
    await actAsync(() =>
      result.current.hook.actions.onRequest(UNLINK_URL, METHOD.DELETE, ROW_A),
    );
    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "Received 500 response",
    ]);

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await actAsync(() =>
      result.current.hook.actions.onRequest(UNLINK_URL, METHOD.DELETE, ROW_B),
    );

    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "Received 500 response",
    ]);
  });

  it("dismisses a row's own failure when that row is retried successfully", async () => {
    // The other half. A dismissal narrow enough to be safe still has to fire
    // when the message it cleared has actually become false.
    const { result } = renderHookWithSnackbar(() => useScopedRequest());

    mockFetchResource.mockResolvedValue(createMockResponse(500));
    await actAsync(() =>
      result.current.hook.actions.onRequest(UNLINK_URL, METHOD.DELETE, ROW_A),
    );
    expect(snackbarMessages(result.current.snackbar)).toHaveLength(1);

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await actAsync(() =>
      result.current.hook.actions.onRequest(UNLINK_URL, METHOD.DELETE, ROW_A),
    );

    expect(snackbarMessages(result.current.snackbar)).toEqual([]);
  });

  it("does not let one feature's success dismiss another feature's failure", async () => {
    // Different features necessarily issue different requests, so their keys
    // differ and neither can clear the other.
    const { result } = renderHookWithSnackbar(() => ({
      archive: useScopedRequest(),
      unlink: useScopedRequest(),
    }));

    mockFetchResource.mockResolvedValue(createMockResponse(500));
    await actAsync(() =>
      result.current.hook.archive.actions.onRequest(
        "/api/atlases/a/files/archive",
        METHOD.PATCH,
        {
          fileIds: ["file-a"],
        },
      ),
    );
    expect(snackbarMessages(result.current.snackbar)).toHaveLength(1);

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await actAsync(() =>
      result.current.hook.unlink.actions.onRequest(
        UNLINK_URL,
        METHOD.DELETE,
        ROW_A,
      ),
    );

    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "Received 500 response",
    ]);
  });

  it("keeps a failure pinned against one entity when the next one succeeds", async () => {
    // The cross-entity hole the per-feature scope left open: the scope carried
    // no entity, so deleting study B cleared study A's failure.
    const { result } = renderHookWithSnackbar(() => useScopedRequest());

    mockFetchResource.mockResolvedValue(createMockResponse(500));
    await actAsync(() =>
      result.current.hook.actions.onRequest(
        "/api/atlases/a/source-studies/s1",
        METHOD.DELETE,
        undefined,
      ),
    );
    expect(snackbarMessages(result.current.snackbar)).toHaveLength(1);

    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    await actAsync(() =>
      result.current.hook.actions.onRequest(
        "/api/atlases/a/source-studies/s2",
        METHOD.DELETE,
        undefined,
      ),
    );

    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "Received 500 response",
    ]);
  });

  it("invalidates the declared keys, staying pending only for the awaited ones", async () => {
    // The shared implementation behind every request hook's
    // `invalidateQueryKeys` (#1553): a call site declares which caches a
    // success refreshes and which of them its pending window waits for, and
    // the layer performs both, so neither can be lost to a forgotten `return`
    // in `onSuccess`. Resolving the awaited key *alone* is what makes this a
    // test: an implementation awaiting both keys is still pending here.
    mockFetchResource.mockResolvedValue(createMockResponse(200, {}));
    const { invalidatedKeys, queryClient, resolve } = mockQueryClient();
    const { result } = renderHookWithSnackbar(
      () => useScopedRequest(),
      queryClient,
    );

    let requested: Promise<boolean> | undefined;
    await act(async () => {
      requested = result.current.hook.actions.onRequest(
        UNLINK_URL,
        METHOD.DELETE,
        ROW_A,
        {
          invalidateQueryKeys: {
            awaited: [["detail"]],
            dispatched: [["list"]],
          },
        },
      );
    });
    // Dispatched keys go first so they can't cancel an awaited refetch.
    expect(invalidatedKeys()).toEqual([["list"], ["detail"]]);
    expect(await isPending(requested)).toBe(true);

    await act(async () => {
      resolve(["detail"]);
    });
    await expect(requested).resolves.toBe(true);
  });

  it("still invalidates the declared keys when the success body can't be parsed", async () => {
    // The server accepted the request, so the mutation has taken effect: the
    // caller not being able to read its result is a failure to report, not a
    // reason to leave the caches it changed stale.
    mockFetchResource.mockResolvedValue(createMockResponse(200));
    const { invalidatedKeys, queryClient, resolve } = mockQueryClient();
    const { result } = renderHookWithSnackbar(
      () => useScopedRequest(),
      queryClient,
    );
    const onSuccess = jest.fn();

    let requested: Promise<boolean> | undefined;
    await act(async () => {
      requested = result.current.hook.actions.onRequest(
        UNLINK_URL,
        METHOD.DELETE,
        ROW_A,
        {
          invalidateQueryKeys: {
            awaited: [["detail"]],
            dispatched: [["list"]],
          },
          onSuccess,
          parseBody: () => Promise.reject(new Error("unreadable body")),
        },
      );
    });
    expect(invalidatedKeys()).toEqual([["list"], ["detail"]]);
    expect(snackbarMessages(result.current.snackbar)).toEqual([
      "unreadable body",
    ]);
    // Held until the awaited refetch lands, as on any committed request.
    expect(await isPending(requested)).toBe(true);

    await act(async () => {
      resolve(["detail"]);
    });
    await expect(requested).resolves.toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
