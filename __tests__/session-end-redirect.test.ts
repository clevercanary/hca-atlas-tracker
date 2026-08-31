import { act, renderHook, waitFor } from "@testing-library/react";

jest.mock("next/router", () => ({
  __esModule: true,
  useRouter: jest.fn(),
}));
jest.mock("@databiosphere/findable-ui/lib/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));
// The hook re-reads the session before navigating, so every test controls what
// that confirming read returns. Default is "genuinely gone" (see beforeEach).
jest.mock("next-auth/react", () => ({
  getSession: jest.fn(),
}));
// `attemptLeaveStrandedPage` ends in `window.location.replace`, which jsdom
// hard-locks (non-configurable `location`, non-writable `replace`) and refuses
// to perform. Stub it for the hook tests and keep the real `whenOnline`, so the
// deferral logic under test is the shipped one. Its two halves are covered
// directly instead — the attempt cap on `claimSessionEndRedirect`, the
// destination on `getSessionEndUrl` — and the real composition is exercised via
// `requireActual` where claim timing matters. The navigation itself is verified
// against the running app.
jest.mock("@/app/hooks/UseSessionEndRedirect/utils", () => ({
  ...jest.requireActual("@/app/hooks/UseSessionEndRedirect/utils"),
  attemptLeaveStrandedPage: jest.fn(),
}));

import {
  MAX_REDIRECT_ATTEMPTS,
  REDIRECT_ATTEMPTS_KEY,
  SESSION_END_URL,
  SESSION_SEEN_KEY,
} from "@/app/hooks/UseSessionEndRedirect/constants";
import { useSessionEndRedirect } from "@/app/hooks/UseSessionEndRedirect/hook";
import {
  attemptLeaveStrandedPage,
  claimSessionEndRedirect,
  getSessionEndUrl,
  isStrandedOnProtectedPath,
  releaseSessionEndRedirect,
  whenOnline,
} from "@/app/hooks/UseSessionEndRedirect/utils";
import { ROUTE } from "@/app/routes/constants";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { AUTH_STATUS } from "@databiosphere/findable-ui/lib/auth/types/auth";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockAttempt = attemptLeaveStrandedPage as jest.MockedFunction<
  typeof attemptLeaveStrandedPage
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

/**
 * Lets the confirming session read settle, so a navigation that is going to
 * happen has happened by the time the assertion runs.
 * @returns void.
 */
async function flushConfirm(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

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

describe("claimSessionEndRedirect / releaseSessionEndRedirect", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("grants exactly MAX_REDIRECT_ATTEMPTS, then refuses — bounding any loop", () => {
    for (let i = 0; i < MAX_REDIRECT_ATTEMPTS; i++) {
      expect(claimSessionEndRedirect()).toBe(true);
    }
    expect(claimSessionEndRedirect()).toBe(false);
    expect(claimSessionEndRedirect()).toBe(false);
  });

  it("grants again once an authenticated session resets the count", () => {
    while (claimSessionEndRedirect()) {
      /* exhaust the allowance */
    }
    releaseSessionEndRedirect();
    expect(claimSessionEndRedirect()).toBe(true);
  });

  it("records the count in storage so it outlives the full document load", () => {
    claimSessionEndRedirect();
    expect(window.sessionStorage.getItem(REDIRECT_ATTEMPTS_KEY)).toEqual("1");
    claimSessionEndRedirect();
    expect(window.sessionStorage.getItem(REDIRECT_ATTEMPTS_KEY)).toEqual("2");
    releaseSessionEndRedirect();
    expect(window.sessionStorage.getItem(REDIRECT_ATTEMPTS_KEY)).toBeNull();
  });

  it("treats a corrupt stored count as no attempts spent", () => {
    window.sessionStorage.setItem(REDIRECT_ATTEMPTS_KEY, "not-a-number");
    expect(claimSessionEndRedirect()).toBe(true);
    expect(window.sessionStorage.getItem(REDIRECT_ATTEMPTS_KEY)).toEqual("1");
  });

  it("refuses when the count reads but cannot be written, rather than looping", () => {
    // Readable-but-not-writable (quota) would otherwise grant an attempt that
    // is never recorded, so every document load reads zero and navigates again.
    const setItem = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });
    expect(claimSessionEndRedirect()).toBe(false);
    setItem.mockRestore();
  });

  it("allows the attempt when storage is unavailable", () => {
    // jsdom proxies the storage instance, so spy on the prototype.
    const getItem = jest
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("storage blocked");
      });
    expect(claimSessionEndRedirect()).toBe(true);
    expect(() => releaseSessionEndRedirect()).not.toThrow();
    getItem.mockRestore();
  });
});

describe("getSessionEndUrl", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("omits the inactivity param when this tab never held a session", () => {
    // A logged-out visitor reaching a non-public path — a dot-containing 404,
    // or a client navigation — skips the middleware and strands here. Moving
    // them on is right; telling them a session expired is not.
    expect(getSessionEndUrl()).toEqual(ROUTE.LANDING);
  });

  it("carries the inactivity param once a session has been held", () => {
    window.sessionStorage.setItem(SESSION_SEEN_KEY, "true");
    expect(getSessionEndUrl()).toEqual(SESSION_END_URL);
  });

  it("consumes the flag, so a later strand does not repeat the banner", () => {
    window.sessionStorage.setItem(SESSION_SEEN_KEY, "true");
    expect(getSessionEndUrl()).toEqual(SESSION_END_URL);
    expect(getSessionEndUrl()).toEqual(ROUTE.LANDING);
  });
});

describe("attempt timing", () => {
  // The shipped composition, not the stub the hook tests use.
  const { attemptLeaveStrandedPage: realAttempt } = jest.requireActual<
    typeof import("@/app/hooks/UseSessionEndRedirect/utils")
  >("@/app/hooks/UseSessionEndRedirect/utils");

  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("does not navigate once the allowance is spent, so a failing endpoint cannot loop", () => {
    // Stand in for previous document loads having spent the whole allowance.
    // A refused attempt returns before navigating, so nothing is consumed.
    window.sessionStorage.setItem(
      REDIRECT_ATTEMPTS_KEY,
      String(MAX_REDIRECT_ATTEMPTS),
    );
    window.sessionStorage.setItem(SESSION_SEEN_KEY, "true");

    realAttempt();

    expect(window.sessionStorage.getItem(REDIRECT_ATTEMPTS_KEY)).toEqual(
      String(MAX_REDIRECT_ATTEMPTS),
    );
    // The destination flag is untouched too — nothing was navigated to.
    expect(window.sessionStorage.getItem(SESSION_SEEN_KEY)).toEqual("true");
  });

  it("spends no attempt on a navigation deferred offline and then dropped", () => {
    // Claiming up front would exhaust the allowance without ever navigating,
    // stranding the tab for good once the network came back.
    setOnLine(false);
    const cleanup = whenOnline(realAttempt);
    expect(window.sessionStorage.getItem(REDIRECT_ATTEMPTS_KEY)).toBeNull();

    cleanup?.();
    window.dispatchEvent(new Event("online"));
    expect(window.sessionStorage.getItem(REDIRECT_ATTEMPTS_KEY)).toBeNull();
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
    mockAttempt.mockReset();
    mockGetSession.mockReset();
    mockGetSession.mockResolvedValue(null);
    setOnLine(true);
    window.sessionStorage.clear();
  });

  it("leaves the page by full load when the session ends on a protected page", async () => {
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, true));
    const { rerender } = renderHook(() => useSessionEndRedirect());
    expect(mockAttempt).not.toHaveBeenCalled();

    // Passive expiry: the next session poll reports no session.
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    rerender();
    await waitFor(() => expect(mockAttempt).toHaveBeenCalled());
  });

  it("does not navigate while auth is still pending", () => {
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.PENDING, false));
    renderHook(() => useSessionEndRedirect());
    expect(mockAttempt).not.toHaveBeenCalled();
  });

  it("does not navigate on a public path, so there is no redirect loop", () => {
    // The post-redirect URL itself: query string stripped, this is `/`.
    setPath(SESSION_END_URL);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    renderHook(() => useSessionEndRedirect());
    expect(mockAttempt).not.toHaveBeenCalled();
  });

  it("navigates once, not on every re-render", async () => {
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    const { rerender } = renderHook(() => useSessionEndRedirect());
    rerender();
    rerender();
    await flushConfirm();
    expect(mockAttempt).toHaveBeenCalledTimes(1);
  });

  it("defers the navigation while offline, then goes once back online", async () => {
    setOnLine(false);
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    renderHook(() => useSessionEndRedirect());
    // Offline, the browser would only show its network error page.
    await flushConfirm();
    expect(mockAttempt).not.toHaveBeenCalled();

    setOnLine(true);
    window.dispatchEvent(new Event("online"));
    await waitFor(() => expect(mockAttempt).toHaveBeenCalled());
  });

  it("resets the count once authenticated, so a later expiry still navigates", async () => {
    window.sessionStorage.setItem(
      REDIRECT_ATTEMPTS_KEY,
      String(MAX_REDIRECT_ATTEMPTS),
    );
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, true));
    const { rerender } = renderHook(() => useSessionEndRedirect());
    expect(window.sessionStorage.getItem(REDIRECT_ATTEMPTS_KEY)).toBeNull();

    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    rerender();
    await waitFor(() => expect(mockAttempt).toHaveBeenCalledTimes(1));
  });

  it("drops the deferred navigation when the page unmounts first", async () => {
    setOnLine(false);
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    const { unmount } = renderHook(() => useSessionEndRedirect());
    unmount();

    setOnLine(true);
    window.dispatchEvent(new Event("online"));
    await flushConfirm();
    expect(mockAttempt).not.toHaveBeenCalled();
  });

  it("does not navigate when the confirming read finds a live session", async () => {
    // The false alarm this guards: next-auth reports no session on *any* failed
    // `/api/auth/session` request, so one 502 on the poll is indistinguishable
    // from a logout. Navigating on it would discard whatever the user was
    // partway through typing.
    mockGetSession.mockResolvedValue({ expires: "2099-01-01T00:00:00.000Z" });
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    renderHook(() => useSessionEndRedirect());
    await flushConfirm();
    expect(mockAttempt).not.toHaveBeenCalled();
  });

  it("holds the page when the confirming read itself fails", async () => {
    // Inconclusive is not confirmation. Staying on a stale page is recoverable;
    // navigating away from unsaved work is not.
    mockGetSession.mockRejectedValue(new Error("network down"));
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    renderHook(() => useSessionEndRedirect());
    await flushConfirm();
    expect(mockAttempt).not.toHaveBeenCalled();
  });

  it("does not navigate if the page unmounts while the confirm is in flight", async () => {
    let resolveConfirm: ((value: null) => void) | undefined;
    mockGetSession.mockReturnValue(
      new Promise<null>((r) => {
        resolveConfirm = r;
      }),
    );
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    const { unmount } = renderHook(() => useSessionEndRedirect());
    unmount();
    resolveConfirm?.(null);
    await flushConfirm();
    expect(mockAttempt).not.toHaveBeenCalled();
  });
});
