import { ACTIVE_USER } from "@/app/hooks/UseFetchActiveUser/query/constants";
import { useQuery } from "@/app/hooks/UseFetchActiveUser/query/useQuery";
import { createQueryClientWrapper } from "@/testing/query";
import { QueryClient } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

describe("useFetchActiveUser query (throwOnError gating)", () => {
  it("does not re-throw a cached error to a logged-out user", async () => {
    // Mirror the app defaults (throwOnError: true) so the per-query
    // throwOnError gating is what prevents the throw, not a lax test client.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, throwOnError: true } },
    });
    // Seed the active-user query into an error state, as if an authenticated
    // /api/me fetch had failed before the user logged out.
    await queryClient.prefetchQuery({
      queryFn: () => Promise.reject(new Error("boom")),
      queryKey: [ACTIVE_USER],
    });

    // Render while unauthenticated: throwOnError is gated on isAuthenticated, so
    // the cached error must NOT be re-thrown (renderHook would crash if it did,
    // which is exactly the logout-trap regression this guards against).
    const { result } = renderHook(() => useQuery("/api/me", false), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("boom");
  });
});
