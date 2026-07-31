import { UseQueryResult } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";

jest.mock("@databiosphere/findable-ui/lib/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("@/app/hooks/UseFetchActiveUser/query/useQuery", () => ({
  useQuery: jest.fn(),
}));

import { HCAAtlasTrackerActiveUser } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useFetchActiveUser } from "@/app/hooks/UseFetchActiveUser/hook";
import { useQuery } from "@/app/hooks/UseFetchActiveUser/query/useQuery";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";

const AUTH_STATUS_PENDING = "PENDING" as const;
const AUTH_STATUS_SETTLED = "SETTLED" as const;

const USER = { email: "user@example.com" } as HCAAtlasTrackerActiveUser;

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

/**
 * Build a minimal `useAuth()` return value, typed loosely (we only care about
 * the two fields the hook reads).
 * @param status - Auth status (PENDING or SETTLED).
 * @param isAuthenticated - Whether the user is authenticated.
 * @returns Mock useAuth return.
 */
function authStateOf(
  status: typeof AUTH_STATUS_PENDING | typeof AUTH_STATUS_SETTLED,
  isAuthenticated: boolean,
): ReturnType<typeof useAuth> {
  return { authState: { isAuthenticated, status } } as ReturnType<
    typeof useAuth
  >;
}

/**
 * Build a minimal active-user query result exposing the two fields the hook
 * reads (`data` and `isSuccess`).
 * @param data - The active user (or undefined).
 * @param isSuccess - Whether the query has succeeded.
 * @returns Mock useQuery return.
 */
function queryResultOf(
  data: HCAAtlasTrackerActiveUser | undefined,
  isSuccess: boolean,
): ReturnType<typeof useQuery> {
  return { data, isSuccess } as UseQueryResult<HCAAtlasTrackerActiveUser>;
}

describe("useFetchActiveUser.isSettled", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseQuery.mockReset();
  });

  it("is false while auth status is PENDING (no user fetched yet)", () => {
    mockUseAuth.mockReturnValue(authStateOf(AUTH_STATUS_PENDING, false));
    mockUseQuery.mockReturnValue(queryResultOf(undefined, false));
    const { result } = renderHook(() => useFetchActiveUser());
    expect(result.current).toEqual({ isSettled: false, user: undefined });
  });

  it("is true on an unauthenticated visit once auth settles (no fetch attempted)", () => {
    mockUseAuth.mockReturnValue(authStateOf(AUTH_STATUS_SETTLED, false));
    mockUseQuery.mockReturnValue(queryResultOf(undefined, false));
    const { result } = renderHook(() => useFetchActiveUser());
    expect(result.current).toEqual({ isSettled: true, user: undefined });
  });

  it("is false when authenticated and the user query has not yet succeeded", () => {
    mockUseAuth.mockReturnValue(authStateOf(AUTH_STATUS_SETTLED, true));
    mockUseQuery.mockReturnValue(queryResultOf(undefined, false));
    const { result } = renderHook(() => useFetchActiveUser());
    expect(result.current).toEqual({ isSettled: false, user: undefined });
  });

  it("is true when authenticated and the user query has succeeded with data", () => {
    mockUseAuth.mockReturnValue(authStateOf(AUTH_STATUS_SETTLED, true));
    mockUseQuery.mockReturnValue(queryResultOf(USER, true));
    const { result } = renderHook(() => useFetchActiveUser());
    expect(result.current).toEqual({ isSettled: true, user: USER });
  });

  it("is true on a succeeded query even when no user record was returned", () => {
    mockUseAuth.mockReturnValue(authStateOf(AUTH_STATUS_SETTLED, true));
    mockUseQuery.mockReturnValue(queryResultOf(undefined, true));
    const { result } = renderHook(() => useFetchActiveUser());
    expect(result.current).toEqual({ isSettled: true, user: undefined });
  });
});
