import { renderHook } from "@testing-library/react";

jest.mock("@databiosphere/findable-ui/lib/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../app/hooks/useFetchData", () => {
  const FETCH_PROGRESS = {
    COMPLETED: "COMPLETED",
    FETCHING: "FETCHING",
    INACTIVE: "INACTIVE",
  } as const;
  return { FETCH_PROGRESS, useFetchData: jest.fn() };
});

import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { HCAAtlasTrackerActiveUser } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { useFetchActiveUser } from "../app/hooks/UseFetchActiveUser/hook";
import { FETCH_PROGRESS, useFetchData } from "../app/hooks/useFetchData";

const AUTH_STATUS_PENDING = "PENDING" as const;
const AUTH_STATUS_SETTLED = "SETTLED" as const;

const USER = { email: "user@example.com" } as HCAAtlasTrackerActiveUser;

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseFetchData = useFetchData as jest.MockedFunction<
  typeof useFetchData
>;

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

describe("useFetchActiveUser.isSettled", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseFetchData.mockReset();
  });

  it("is false while auth status is PENDING (no user fetched yet)", () => {
    mockUseAuth.mockReturnValue(authStateOf(AUTH_STATUS_PENDING, false));
    mockUseFetchData.mockReturnValue({
      data: undefined,
      isSuccess: false,
      progress: FETCH_PROGRESS.INACTIVE,
    });
    const { result } = renderHook(() => useFetchActiveUser());
    expect(result.current).toEqual({ isSettled: false, user: undefined });
  });

  it("is true on an unauthenticated visit once auth settles (no fetch attempted)", () => {
    mockUseAuth.mockReturnValue(authStateOf(AUTH_STATUS_SETTLED, false));
    mockUseFetchData.mockReturnValue({
      data: undefined,
      isSuccess: false,
      progress: FETCH_PROGRESS.INACTIVE,
    });
    const { result } = renderHook(() => useFetchActiveUser());
    expect(result.current).toEqual({ isSettled: true, user: undefined });
  });

  it("is false when authenticated and the user fetch is still in flight", () => {
    mockUseAuth.mockReturnValue(authStateOf(AUTH_STATUS_SETTLED, true));
    mockUseFetchData.mockReturnValue({
      data: undefined,
      isSuccess: false,
      progress: FETCH_PROGRESS.FETCHING,
    });
    const { result } = renderHook(() => useFetchActiveUser());
    expect(result.current).toEqual({ isSettled: false, user: undefined });
  });

  it("is true when authenticated and the user fetch has completed with data", () => {
    mockUseAuth.mockReturnValue(authStateOf(AUTH_STATUS_SETTLED, true));
    mockUseFetchData.mockReturnValue({
      data: USER,
      isSuccess: true,
      progress: FETCH_PROGRESS.COMPLETED,
    });
    const { result } = renderHook(() => useFetchActiveUser());
    expect(result.current).toEqual({ isSettled: true, user: USER });
  });

  it("is false when authenticated and the fetch hook is still INACTIVE (pre-effect tick)", () => {
    mockUseAuth.mockReturnValue(authStateOf(AUTH_STATUS_SETTLED, true));
    mockUseFetchData.mockReturnValue({
      data: undefined,
      isSuccess: false,
      progress: FETCH_PROGRESS.INACTIVE,
    });
    const { result } = renderHook(() => useFetchActiveUser());
    expect(result.current.isSettled).toBe(false);
  });

  it("is true on a completed fetch even when no user record was returned", () => {
    mockUseAuth.mockReturnValue(authStateOf(AUTH_STATUS_SETTLED, true));
    mockUseFetchData.mockReturnValue({
      data: undefined,
      isSuccess: true,
      progress: FETCH_PROGRESS.COMPLETED,
    });
    const { result } = renderHook(() => useFetchActiveUser());
    expect(result.current).toEqual({ isSettled: true, user: undefined });
  });
});
