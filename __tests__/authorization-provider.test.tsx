import { createQueryClientWrapper } from "@/testing/query";
import { QueryClient } from "@tanstack/react-query";
import { render } from "@testing-library/react";

jest.mock("@databiosphere/findable-ui/lib/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("@/app/hooks/UseFetchActiveUser/hook", () => ({
  useFetchActiveUser: jest.fn(),
}));
// `useSessionEndRedirect` reads the router. `asPath: "/"` is a public path, so
// the redirect stays inert and these assertions stay about the query cache.
jest.mock("next/router", () => ({
  __esModule: true,
  default: { push: jest.fn() },
  useRouter: (): { asPath: string } => ({ asPath: "/" }),
}));

import { type HCAAtlasTrackerActiveUser } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useFetchActiveUser } from "@/app/hooks/UseFetchActiveUser/hook";
import { AuthorizationProvider } from "@/app/providers/authorization";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseFetchActiveUser = useFetchActiveUser as jest.MockedFunction<
  typeof useFetchActiveUser
>;

const USER = { email: "user@example.com" } as HCAAtlasTrackerActiveUser;

/**
 * Build a minimal `useAuth()` return value exposing the fields
 * AuthorizationProvider reads (`isAuthenticated` and `service`).
 * @param isAuthenticated - Whether the user is authenticated.
 * @returns Mock useAuth return.
 */
function authStateOf(isAuthenticated: boolean): ReturnType<typeof useAuth> {
  return {
    authState: { isAuthenticated },
    service: undefined,
  } as ReturnType<typeof useAuth>;
}

describe("AuthorizationProvider", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseFetchActiveUser.mockReset();
  });

  it("clears the React Query cache when the user becomes unauthenticated", () => {
    const queryClient = new QueryClient();
    // Seed a query as if it had been fetched while authenticated.
    queryClient.setQueryData(["atlas", "a1"], { id: "a1" });
    expect(queryClient.getQueryCache().getAll()).toHaveLength(1);

    const wrapper = createQueryClientWrapper(queryClient);

    // Authenticated: cache is left intact.
    mockUseAuth.mockReturnValue(authStateOf(true));
    mockUseFetchActiveUser.mockReturnValue({ isSettled: true, user: USER });
    const { rerender } = render(
      <AuthorizationProvider>{null}</AuthorizationProvider>,
      {
        wrapper,
      },
    );
    expect(queryClient.getQueryCache().getAll()).toHaveLength(1);

    // Logout: cache is cleared on the unauthenticated transition.
    mockUseAuth.mockReturnValue(authStateOf(false));
    mockUseFetchActiveUser.mockReturnValue({
      isSettled: true,
      user: undefined,
    });
    rerender(<AuthorizationProvider>{null}</AuthorizationProvider>);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });
});
