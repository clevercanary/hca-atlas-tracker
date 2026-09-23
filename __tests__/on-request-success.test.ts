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
    // TanStack's default `cancelRefetch: true`, the awaited fetch already in
    // flight. Were the awaited promise to settle on that cancellation, the
    // pending window would close before the new data landed — #1553's stale
    // state again. The layer dispatches first, without `cancelRefetch`, so the
    // window holds by construction; this pins it against a real client, so a
    // library change to how a cancelled fetch settles is caught here.
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

    const settled = onRequestSuccess(queryClient, createMockResponse(200), {
      invalidateQueryKeys: {
        awaited: [["atlas", "id", "x"]],
        dispatched: [["atlas", "id"]],
      },
    });

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
});
