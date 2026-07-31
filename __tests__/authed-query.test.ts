jest.mock("@databiosphere/findable-ui/lib/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, FunctionComponent, PropsWithChildren } from "react";
import { useAuthedQuery } from "../app/query/useAuthedQuery";

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

/**
 * Build a minimal useAuth() return exposing only isAuthenticated.
 * @param isAuthenticated - Whether a user is authenticated.
 * @returns Mock useAuth return.
 */
function authStateOf(isAuthenticated: boolean): ReturnType<typeof useAuth> {
  return { authState: { isAuthenticated } } as ReturnType<typeof useAuth>;
}

/**
 * Wraps a rendered hook in a QueryClientProvider with retries disabled.
 * @param queryClient - The QueryClient to provide.
 * @returns Wrapper component.
 */
function wrapperFor(
  queryClient: QueryClient,
): FunctionComponent<PropsWithChildren> {
  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useAuthedQuery (throwOnError gating)", () => {
  afterEach(() => {
    mockUseAuth.mockReset();
  });

  it("does not re-throw a cached error to a logged-out user", async () => {
    // Logged out: enabled is false (no fetch), but a previously-cached error
    // must not be re-thrown during the logout render.
    mockUseAuth.mockReturnValue(authStateOf(false));

    // Mirror the app defaults (throwOnError: true) so the per-query throwOnError
    // gating is what prevents the throw, not a lax test client.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, throwOnError: true } },
    });
    // Seed the query into an error state, as if an authenticated fetch had
    // failed before the user logged out.
    await queryClient.prefetchQuery({
      queryFn: () => Promise.reject(new Error("boom")),
      queryKey: ["authed-query-test"],
    });

    // renderHook would crash if throwOnError were not gated on isAuthenticated —
    // that crash is exactly the logout-trap regression this guards against.
    const { result } = renderHook(
      () =>
        useAuthedQuery<unknown>({
          queryKey: ["authed-query-test"],
          requestUrl: "/api/test",
        }),
      { wrapper: wrapperFor(queryClient) },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("boom");
  });
});
