import { renderHook } from "@testing-library/react";

jest.mock("next/router", () => ({
  __esModule: true,
  useRouter: jest.fn(),
}));
jest.mock("@databiosphere/findable-ui/lib/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));
// `leaveStrandedPage` is a one-line `window.location.assign`, which jsdom
// hard-locks (non-configurable `location`, non-writable `assign`) and refuses
// to perform. Stub just that primitive and keep the real `whenOnline`, so the
// deferral logic under test is the shipped one. The navigation itself is
// verified against the running app.
jest.mock("@/app/hooks/UseSessionEndRedirect/utils", () => ({
  ...jest.requireActual("@/app/hooks/UseSessionEndRedirect/utils"),
  leaveStrandedPage: jest.fn(),
}));

import { SESSION_END_URL } from "@/app/hooks/UseSessionEndRedirect/constants";
import { useSessionEndRedirect } from "@/app/hooks/UseSessionEndRedirect/hook";
import {
  isStrandedOnProtectedPath,
  leaveStrandedPage,
  whenOnline,
} from "@/app/hooks/UseSessionEndRedirect/utils";
import { ROUTE } from "@/app/routes/constants";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { AUTH_STATUS } from "@databiosphere/findable-ui/lib/auth/types/auth";
import { useRouter } from "next/router";

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockLeave = leaveStrandedPage as jest.MockedFunction<
  typeof leaveStrandedPage
>;

/**
 * Returns a partial `useAuth()` mock exposing only the auth state the hook
 * reads. Cast to the full type so TypeScript accepts it as a mock return.
 * @param status - Auth status.
 * @param isAuthenticated - Whether the user is authenticated.
 * @returns Mock useAuth return.
 */
function authOf(
  status: AUTH_STATUS,
  isAuthenticated: boolean,
): ReturnType<typeof useAuth> {
  return { authState: { isAuthenticated, status } } as ReturnType<
    typeof useAuth
  >;
}

/**
 * Sets the browser's reported connectivity for the duration of a test.
 * @param onLine - Whether the browser should report being online.
 * @returns void.
 */
function setOnLine(onLine: boolean): void {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: onLine,
  });
}

/**
 * Points the mocked router at a path.
 * @param asPath - Path to expose as `asPath`.
 * @returns void.
 */
function setPath(asPath: string): void {
  mockUseRouter.mockReturnValue({ asPath } as ReturnType<typeof useRouter>);
}

describe("SESSION_END_URL", () => {
  it("targets the landing page with the inactivity param the banner reads", () => {
    expect(SESSION_END_URL).toEqual("/?inactivityTimeout=true");
  });
});

describe("isStrandedOnProtectedPath", () => {
  it("is true when the session is gone on a protected path", () => {
    expect(
      isStrandedOnProtectedPath(AUTH_STATUS.SETTLED, false, ROUTE.ATLASES),
    ).toBe(true);
  });

  it("is false while auth is still pending", () => {
    expect(
      isStrandedOnProtectedPath(AUTH_STATUS.PENDING, false, ROUTE.ATLASES),
    ).toBe(false);
  });

  it("is false when the user is authenticated", () => {
    expect(
      isStrandedOnProtectedPath(AUTH_STATUS.SETTLED, true, ROUTE.ATLASES),
    ).toBe(false);
  });

  it.each([
    ROUTE.LANDING,
    ROUTE.ACCOUNT_DISABLED,
    ROUTE.REQUESTING_ELEVATED_PERMISSIONS,
    ROUTE.VALIDATING_ATLAS_SOURCE_STUDY_LIST,
  ])("is false on the public path %s", (pathname) => {
    expect(
      isStrandedOnProtectedPath(AUTH_STATUS.SETTLED, false, pathname),
    ).toBe(false);
  });
});

describe("whenOnline", () => {
  it("navigates immediately when online", () => {
    setOnLine(true);
    const navigate = jest.fn();
    expect(whenOnline(navigate)).toBeUndefined();
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("holds the navigation until the browser comes back online", () => {
    setOnLine(false);
    const navigate = jest.fn();
    const cleanup = whenOnline(navigate);
    expect(navigate).not.toHaveBeenCalled();

    window.dispatchEvent(new Event("online"));
    expect(navigate).toHaveBeenCalledTimes(1);
    cleanup?.();
  });

  it("cleanup drops a deferred navigation", () => {
    setOnLine(false);
    const navigate = jest.fn();
    whenOnline(navigate)?.();

    window.dispatchEvent(new Event("online"));
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe("useSessionEndRedirect", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseRouter.mockReset();
    mockLeave.mockReset();
    setOnLine(true);
  });

  it("leaves the page by full load when the session ends on a protected page", () => {
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, true));
    const { rerender } = renderHook(() => useSessionEndRedirect());
    expect(mockLeave).not.toHaveBeenCalled();

    // Passive expiry: the next session poll reports no session.
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    rerender();
    expect(mockLeave).toHaveBeenCalled();
  });

  it("does not navigate while auth is still pending", () => {
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.PENDING, false));
    renderHook(() => useSessionEndRedirect());
    expect(mockLeave).not.toHaveBeenCalled();
  });

  it("does not navigate on a public path, so there is no redirect loop", () => {
    // The post-redirect URL itself: query string stripped, this is `/`.
    setPath(SESSION_END_URL);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    renderHook(() => useSessionEndRedirect());
    expect(mockLeave).not.toHaveBeenCalled();
  });

  it("navigates once, not on every re-render", () => {
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    const { rerender } = renderHook(() => useSessionEndRedirect());
    rerender();
    rerender();
    expect(mockLeave).toHaveBeenCalledTimes(1);
  });

  it("defers the navigation while offline, then goes once back online", () => {
    setOnLine(false);
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    renderHook(() => useSessionEndRedirect());
    // Offline, the browser would only show its network error page.
    expect(mockLeave).not.toHaveBeenCalled();

    setOnLine(true);
    window.dispatchEvent(new Event("online"));
    expect(mockLeave).toHaveBeenCalled();
  });

  it("drops the deferred navigation when the page unmounts first", () => {
    setOnLine(false);
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    const { unmount } = renderHook(() => useSessionEndRedirect());
    unmount();

    setOnLine(true);
    window.dispatchEvent(new Event("online"));
    expect(mockLeave).not.toHaveBeenCalled();
  });
});
