import { onRequestSuccess } from "@/app/common/requests";
import { createMockResponse, isPending } from "@/testing/utils";
import { QueryClient, QueryObserver } from "@tanstack/react-query";

/**
 * A query whose fetch is controlled by the test: it resolves only when the
 * returned `finish` is called (the latest fetch, should one be restarted).
 * @param queryClient - Query client to register the query on.
 * @param queryKey - Query key.
 * @returns the finish function.
 */
function seedControlledQuery(
  queryClient: QueryClient,
  queryKey: unknown[],
): { finish: () => void } {
  let finish: () => void = () => undefined;
  queryClient.setQueryData(queryKey, "stale");
  queryClient.setQueryDefaults(queryKey, {
    queryFn: () =>
      new Promise<string>((resolve) => {
        finish = (): void => resolve("fresh");
      }),
  });
  return { finish: () => finish() };
}

describe("onRequestSuccess", () => {
  it("does not let a dispatched key cancel an awaited refetch", async () => {
    // A dispatched key equal to (or prefixing) an awaited key aborts, with
    // TanStack's default `cancelRefetch: true`, any fetch already in flight.
    // Were that the awaited fetch, and the awaited promise to settle on the
    // cancellation, the pending window would close before the new data landed
    // — #1553's stale state again. This pins the outcome against a real
    // client: the window holds when the keys overlap. It does not pin the
    // dispatch order. On the current TanStack a silently cancelled fetch hands
    // its promise to the replacement, so the window holds in either order.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const detail = seedControlledQuery(queryClient, ["atlas", "id", "x"]);
    // Observe so `invalidateQueries` actually refetches (inactive queries only
    // get marked stale); never stale on its own, so subscribing doesn't fetch
    // and the only fetch below is the invalidation's.
    const unsubscribe = new QueryObserver(queryClient, {
      queryKey: ["atlas", "id", "x"],
      staleTime: Infinity,
    }).subscribe(() => undefined);

    const settled = onRequestSuccess(
      queryClient,
      createMockResponse(200),
      undefined,
      {
        invalidateQueryKeys: {
          awaited: [["atlas", "id", "x"]],
          dispatched: [["atlas", "id"]],
        },
      },
    );

    // Let a cancellation propagate: had the awaited fetch been cancelled,
    // `settled` would have resolved here with the cache still stale.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(await isPending(settled)).toBe(true);
    expect(queryClient.getQueryData(["atlas", "id", "x"])).toBe("stale");

    detail.finish();
    await settled;
    expect(queryClient.getQueryData(["atlas", "id", "x"])).toBe("fresh");
    unsubscribe();
  });

  it("refetches a dispatched key whose fetch was already in flight, so pre-mutation data can't win", async () => {
    // A focus or mount refetch sent before the mutation landed is still in
    // flight when the dispatched key is invalidated. Reusing it (as
    // `cancelRefetch: false` does) lets it settle with pre-mutation data and
    // clear the invalidated flag, leaving the cache stale despite the
    // declaration. The default cancels it and fetches again.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const queryKey = ["integratedObject", "a", "c"];
    let serverValue = "pre-mutation";
    const responders: (() => void)[] = [];
    queryClient.setQueryData(queryKey, "initial");
    queryClient.setQueryDefaults(queryKey, {
      queryFn: () => {
        // What the server answers is fixed when the request reaches it.
        const answer = serverValue;
        return new Promise<string>((resolve) => {
          responders.push(() => resolve(answer));
        });
      },
    });
    const unsubscribe = new QueryObserver(queryClient, {
      queryKey,
      staleTime: Infinity,
    }).subscribe(() => undefined);

    // Not awaited: this is the fetch still in flight when the mutation lands.
    const inFlight = queryClient.refetchQueries({ queryKey });
    serverValue = "post-mutation";
    await onRequestSuccess(queryClient, createMockResponse(200), undefined, {
      invalidateQueryKeys: { dispatched: [queryKey] },
    });

    for (const respond of responders) respond();
    await inFlight;
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(queryClient.getQueryData(queryKey)).toBe("post-mutation");
    unsubscribe();
  });
});
