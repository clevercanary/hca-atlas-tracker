import { act, renderHook, waitFor } from "@testing-library/react";

jest.mock("next/router", () => ({
  __esModule: true,
  // `getSessionRootUrl` reads `Router.router?.basePath` off the singleton, so
  // the default export has to exist here as well as `useRouter`.
  default: { router: null },
  useRouter: jest.fn(),
}));
jest.mock("@databiosphere/findable-ui/lib/hooks/useConfig", () => ({
  useConfig: jest.fn(),
}));
jest.mock("@databiosphere/findable-ui/lib/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));
// `leaveStrandedPage` and `reloadStrandedPage` end in `window.location`, which
// jsdom hard-locks (non-configurable `location`, non-writable `replace`) and
// refuses to perform. Stub them for the hook tests and keep everything else
// real, so the read, the classification and the destination under test are the
// shipped ones. The navigation itself is verified against the running app.
jest.mock("@/app/hooks/UseSessionEndRedirect/utils", () => ({
  ...jest.requireActual("@/app/hooks/UseSessionEndRedirect/utils"),
  leaveStrandedPage: jest.fn(),
  reloadStrandedPage: jest.fn(),
}));

import { normalizePagePath } from "@/app/hooks/UseCurrentPath/utils";
import {
  CONFIRM_RETRY_INTERVAL,
  SESSION_URL,
} from "@/app/hooks/UseSessionEndRedirect/constants";
import { useSessionEndRedirect } from "@/app/hooks/UseSessionEndRedirect/hook";
import { SESSION_CONFIRMATION } from "@/app/hooks/UseSessionEndRedirect/types";
import {
  confirmSessionEnded,
  getSessionEndUrl,
  getSessionRootUrl,
  isStrandedOnProtectedPath,
  leaveStrandedPage,
  reloadStrandedPage,
} from "@/app/hooks/UseSessionEndRedirect/utils";
import { ROUTE, SESSION_END_PARAM } from "@/app/routes/constants";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { AUTH_STATUS } from "@databiosphere/findable-ui/lib/auth/types/auth";
import { useSessionCallbackUrl } from "@databiosphere/findable-ui/lib/hooks/authentication/session/useSessionCallbackUrl";
import { INACTIVITY_PARAM } from "@databiosphere/findable-ui/lib/hooks/authentication/session/useSessionTimeout";
import { useConfig } from "@databiosphere/findable-ui/lib/hooks/useConfig";
import { getSession } from "next-auth/react";
import Router, { useRouter } from "next/router";

/**
 * The parts of a `fetch` response the session read touches.
 */
interface FakeResponse {
  json: () => Promise<unknown>;
  ok: boolean;
}

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseConfig = useConfig as jest.MockedFunction<typeof useConfig>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockLeave = leaveStrandedPage as jest.MockedFunction<
  typeof leaveStrandedPage
>;
const mockReload = reloadStrandedPage as jest.MockedFunction<
  typeof reloadStrandedPage
>;
const mockFetch = jest.fn<Promise<FakeResponse>, [string, unknown?]>();

// jsdom has no `fetch`; install the mock as the global the read calls.
Object.defineProperty(globalThis, "fetch", {
  configurable: true,
  value: mockFetch,
  writable: true,
});

const NO_SESSION = {};
const LIVE_SESSION = { expires: "2099-01-01T00:00:00.000Z", user: {} };

/**
 * Returns a response the endpoint might send.
 * @param ok - Whether the status is 2xx.
 * @param body - Parsed JSON body.
 * @returns Fake response.
 */
function respond(ok: boolean, body: unknown): FakeResponse {
  return { json: () => Promise.resolve(body), ok };
}

/**
 * Returns a response whose body fails to parse as JSON.
 * @returns Fake response.
 */
function respondUnparseable(): FakeResponse {
  return {
    json: () => Promise.reject(new SyntaxError("Unexpected token <")),
    ok: true,
  };
}

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

/**
 * Points both session-end destinations at one `basePath` and
 * `redirectRootToPath`: `getSessionRootUrl` reads `Router.router`, while
 * findable-ui's `useSessionCallbackUrl` reads `useRouter()` and `useConfig()`.
 * Feeding both from one call is what lets the drift test compare them.
 *
 * `redirectRootToPath` is a parameter even though this app's code no longer
 * reads it — the hook still does, and the drift test's job is to prove that
 * naming `ROUTE.LANDING` directly lands where the hook's config lookup does.
 * Note this *supplies* that value rather than reading the real config, so no
 * test here observes what the config actually says; `session-end-destination`
 * is what holds the config to the constant. Cast to the full types so
 * TypeScript accepts these partials as mocks.
 * @param basePath - Next.js `basePath`.
 * @param redirectRootToPath - Configured app root, as the hook sees it.
 * @returns void.
 */
function setRoot(basePath: string, redirectRootToPath: string): void {
  Router.router = { basePath } as NonNullable<typeof Router.router>;
  mockUseRouter.mockReturnValue({ basePath } as ReturnType<typeof useRouter>);
  mockUseConfig.mockReturnValue({
    config: { redirectRootToPath },
  } as ReturnType<typeof useConfig>);
}

// `Router.router` is a singleton and is not reset between tests by Jest config
// or `testing/setup` — the "stays total" test below nulls it outright. Pin it,
// and the `useRouter`/`useConfig` mocks, to the shipped defaults so no test
// inherits state left by an earlier one.
beforeEach(() => {
  setRoot("", ROUTE.LANDING);
  mockUseAuth.mockReset();
  mockLeave.mockReset();
  mockReload.mockReset();
  mockFetch.mockReset();
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

  it("is false on the session-end destination, so arriving cannot re-fire", () => {
    // Not a runtime guard: the destination is `ROUTE.LANDING`, which
    // `PUBLIC_PATHS` already contains. This pins that invariant — point the
    // destination somewhere non-public and the hook would re-fire on arrival.
    // Either param gives the same path, so one destination covers both.
    //
    // Deliberately not parameterized over `basePath`: this feeds a document
    // URL (`getSessionEndUrl`, basePath included) into an argument production
    // supplies from `useCurrentPath` → `asPath`, which Next strips basePath
    // from. The two agree only while `next.config.mjs` sets `basePath: ""`.
    expect(
      isStrandedOnProtectedPath(
        AUTH_STATUS.SETTLED,
        false,
        normalizePagePath(getSessionEndUrl(true)),
      ),
    ).toBe(false);
  });
});

describe("confirmSessionEnded", () => {
  it("reads the session endpoint directly", async () => {
    mockFetch.mockResolvedValue(respond(true, NO_SESSION));
    await confirmSessionEnded();
    expect(mockFetch).toHaveBeenCalledWith(SESSION_URL);
  });

  it("reports ENDED when the endpoint answers with no session", async () => {
    mockFetch.mockResolvedValue(respond(true, NO_SESSION));
    await expect(confirmSessionEnded()).resolves.toEqual(
      SESSION_CONFIRMATION.ENDED,
    );
  });

  it("reports LIVE when the endpoint answers with a session", async () => {
    // Distinguished from INCONCLUSIVE because the two want opposite responses:
    // here the client's `null` is known-wrong, so the tab should recover rather
    // than sit still.
    mockFetch.mockResolvedValue(respond(true, LIVE_SESSION));
    await expect(confirmSessionEnded()).resolves.toEqual(
      SESSION_CONFIRMATION.LIVE,
    );
  });

  it.each([
    ["a non-OK status with an empty body", respond(false, NO_SESSION)],
    ["a non-OK status with a session-like body", respond(false, LIVE_SESSION)],
    ["an unparseable body", respondUnparseable()],
    ["a JSON null body", respond(true, null)],
    ["a JSON array body", respond(true, [])],
    ["a JSON string body", respond(true, "ok")],
  ])("reports INCONCLUSIVE for %s", async (_, response) => {
    // `getSession()` would have reported every one of these as "no session".
    mockFetch.mockResolvedValue(response);
    await expect(confirmSessionEnded()).resolves.toEqual(
      SESSION_CONFIRMATION.INCONCLUSIVE,
    );
  });

  it("reports INCONCLUSIVE when the fetch itself fails, as it does offline", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(confirmSessionEnded()).resolves.toEqual(
      SESSION_CONFIRMATION.INCONCLUSIVE,
    );
  });
});

describe("SESSION_URL", () => {
  it("is the URL next-auth's client reads the session from", async () => {
    // Guards against the hook and next-auth's poll reading different
    // endpoints: the real `getSession()` against the same mocked `fetch`.
    mockFetch.mockResolvedValue(respond(true, NO_SESSION));
    await getSession();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toEqual(SESSION_URL);
  });
});

describe("getSessionEndUrl", () => {
  it("carries the inactivity param when this document held a session", () => {
    expect(getSessionEndUrl(true)).toEqual(`/?${INACTIVITY_PARAM}=true`);
  });

  it("carries only the banner-free param when it never held one", () => {
    // A logged-out visitor reaching a non-public path — a dot-containing 404,
    // or a client navigation — skips the middleware and strands here. Moving
    // them on is right; telling them a session expired is not. The param is
    // still needed so the landing page does not bounce a cookied request.
    expect(getSessionEndUrl(false)).toEqual(`/?${SESSION_END_PARAM}=true`);
  });

  it("carries the basePath through to the destination", () => {
    // `location.replace` acts on the document URL, so the prefix has to be
    // there or the recovery navigates out of the app.
    setRoot("/tracker", ROUTE.LANDING);
    expect(getSessionEndUrl(true)).toEqual(
      `/tracker/?${INACTIVITY_PARAM}=true`,
    );
    expect(getSessionEndUrl(false)).toEqual(
      `/tracker/?${SESSION_END_PARAM}=true`,
    );
  });
});

describe("getSessionRootUrl", () => {
  it("is the landing route when no basePath is set", () => {
    expect(getSessionRootUrl()).toEqual(ROUTE.LANDING);
  });

  it("prefixes the basePath, as the idle timer's destination does", () => {
    setRoot("/tracker", ROUTE.LANDING);
    expect(getSessionRootUrl()).toEqual("/tracker/");
  });

  it("stays total before the router has initialized", () => {
    // `Router.router` is null until the router mounts. Unreachable from this
    // module, which only runs from an effect inside a mounted `_app`, but the
    // recovery path must not throw — that would strand the page it exists to
    // escape.
    Router.router = null;
    expect(getSessionRootUrl()).toEqual(ROUTE.LANDING);
  });

  it.each([[""], ["/tracker"]])(
    "agrees with useSessionCallbackUrl for basePath %p",
    (basePath) => {
      // Half of the drift guard for issue #1557. findable-ui's idle timer sends
      // a session end to `useSessionCallbackUrl()`, built from `basePath` plus
      // the config's `redirectRootToPath`; we name `ROUTE.LANDING`.
      //
      // What this pins is the *composition* — basePath prefixing,
      // `URLSearchParams`, ordering — matching the hook's, for a
      // `redirectRootToPath` the test supplies. It does NOT observe the real
      // config: `setRoot` feeds that value in, so pointing
      // `config.redirectRootToPath` at `"/home"` leaves every test in this file
      // green. Holding the config to the constant is
      // `session-end-destination`'s job, and the guard is only sound as the two
      // together.
      //
      // The hook returns an absolute href, so compare as one.
      setRoot(basePath, ROUTE.LANDING);
      const { result } = renderHook(() => useSessionCallbackUrl());
      expect(result.current.callbackUrl).toEqual(
        new URL(getSessionEndUrl(true), window.location.origin).href,
      );
    },
  );
});

describe("useSessionEndRedirect", () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(respond(true, NO_SESSION));
  });

  it("leaves with the banner when a session held by this document ends", async () => {
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, true));
    const { rerender } = renderHook(() => useSessionEndRedirect());
    expect(mockLeave).not.toHaveBeenCalled();

    // Passive expiry: the next session poll reports no session.
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    rerender();
    await waitFor(() =>
      expect(mockLeave).toHaveBeenCalledWith(`/?${INACTIVITY_PARAM}=true`),
    );
    expect(mockLeave).toHaveBeenCalledTimes(1);
  });

  it("leaves without the banner when this document never held a session", async () => {
    // A fresh document after a deliberate sign-out, or a visitor who never
    // signed in, reaching a dot path.
    setPath("/foo.html");
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    renderHook(() => useSessionEndRedirect());
    await waitFor(() =>
      expect(mockLeave).toHaveBeenCalledWith(`/?${SESSION_END_PARAM}=true`),
    );
  });

  it("does not read or navigate while auth is still pending", async () => {
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.PENDING, false));
    renderHook(() => useSessionEndRedirect());
    await flushConfirm();
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockLeave).not.toHaveBeenCalled();
  });

  it("does not navigate on a public path, so there is no redirect loop", async () => {
    // The post-redirect URL itself: query string stripped, this is `/`.
    setPath(`${ROUTE.LANDING}?${INACTIVITY_PARAM}=true`);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    renderHook(() => useSessionEndRedirect());
    await flushConfirm();
    expect(mockLeave).not.toHaveBeenCalled();
  });

  it("navigates once, not on every re-render", async () => {
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    const { rerender } = renderHook(() => useSessionEndRedirect());
    rerender();
    rerender();
    await flushConfirm();
    expect(mockLeave).toHaveBeenCalledTimes(1);
  });

  it("recovers in place, not to the landing page, when the read finds a live session", async () => {
    // One failed poll makes next-auth report no session while the cookie is
    // fine. Leaving would discard whatever the user was in the middle of, and
    // sitting still is wrong too — the tab cannot correct the client's `null`.
    mockFetch.mockResolvedValue(respond(true, LIVE_SESSION));
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    renderHook(() => useSessionEndRedirect());
    await flushConfirm();
    expect(mockLeave).not.toHaveBeenCalled();
    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it("holds the page when the confirming read is inconclusive", async () => {
    // Staying on a stale page is recoverable; navigating away from unsaved
    // work, or onto the browser's network-error page, is not.
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    renderHook(() => useSessionEndRedirect());
    await flushConfirm();
    expect(mockLeave).not.toHaveBeenCalled();
    expect(mockReload).not.toHaveBeenCalled();
  });

  it("does not navigate if the page unmounts while the read is in flight", async () => {
    let resolveFetch: ((value: FakeResponse) => void) | undefined;
    mockFetch.mockReturnValue(
      new Promise<FakeResponse>((r) => {
        resolveFetch = r;
      }),
    );
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    const { unmount } = renderHook(() => useSessionEndRedirect());
    unmount();
    resolveFetch?.(respond(true, NO_SESSION));
    await flushConfirm();
    expect(mockLeave).not.toHaveBeenCalled();
  });

  it("does not depend on browser storage", async () => {
    // jsdom proxies the storage instance, so spy on the prototype.
    const spies = (["getItem", "setItem", "removeItem"] as const).map((name) =>
      jest.spyOn(Storage.prototype, name).mockImplementation(() => {
        throw new Error("storage blocked");
      }),
    );
    try {
      setPath(ROUTE.ATLASES);
      mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, true));
      const { rerender } = renderHook(() => useSessionEndRedirect());
      mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
      rerender();
      await waitFor(() =>
        expect(mockLeave).toHaveBeenCalledWith(`/?${INACTIVITY_PARAM}=true`),
      );
      for (const spy of spies) expect(spy).not.toHaveBeenCalled();
    } finally {
      for (const spy of spies) spy.mockRestore();
    }
  });
});

describe("confirm retry", () => {
  // The reason this exists: `isStranded` is derived from auth state that is now
  // frozen — next-auth gates its poll off once `_session === null` and its
  // focus refetch returns early — so the effect never re-runs and an
  // inconclusive read would otherwise be the tab's one and only shot.
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Advances past one retry interval and lets the read it starts settle.
   * @returns void.
   */
  async function nextRetry(): Promise<void> {
    await act(async () => {
      jest.advanceTimersByTime(CONFIRM_RETRY_INTERVAL);
    });
    await flushConfirm();
  }

  it("retries after an inconclusive read, and leaves once one resolves", async () => {
    // A failed fetch on laptop wake, before the network is back, must not be
    // terminal — and must not navigate onto the browser's error page.
    mockFetch
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(respond(true, NO_SESSION));
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    renderHook(() => useSessionEndRedirect());

    await flushConfirm();
    expect(mockLeave).not.toHaveBeenCalled();

    await nextRetry();
    expect(mockLeave).toHaveBeenCalledTimes(1);
  });

  it("reloads in place once the endpoint recovers with a live session", async () => {
    // A short sleep with a slow network: the session never ended, so the user
    // stays on the same page rather than being sent anywhere.
    mockFetch
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(respond(false, NO_SESSION))
      .mockResolvedValueOnce(respond(true, LIVE_SESSION));
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    renderHook(() => useSessionEndRedirect());

    await flushConfirm();
    await nextRetry();
    expect(mockReload).not.toHaveBeenCalled();

    await nextRetry();
    expect(mockReload).toHaveBeenCalledTimes(1);
    expect(mockLeave).not.toHaveBeenCalled();
  });

  it("keeps retrying, without navigating, while the endpoint keeps failing", async () => {
    // Unbounded on purpose: giving up returns the tab to exactly the stranded
    // state this hook exists to remove. Every read is a GET; none navigates.
    mockFetch.mockResolvedValue(respondUnparseable());
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    renderHook(() => useSessionEndRedirect());

    await flushConfirm();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    for (const expected of [2, 3, 4]) {
      await nextRetry();
      expect(mockFetch).toHaveBeenCalledTimes(expected);
    }
    expect(mockLeave).not.toHaveBeenCalled();
    expect(mockReload).not.toHaveBeenCalled();
  });

  it("stops retrying once the page unmounts", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));
    setPath(ROUTE.ATLASES);
    mockUseAuth.mockReturnValue(authOf(AUTH_STATUS.SETTLED, false));
    const { unmount } = renderHook(() => useSessionEndRedirect());

    await flushConfirm();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    unmount();
    await act(async () => {
      jest.advanceTimersByTime(CONFIRM_RETRY_INTERVAL * 3);
    });
    await flushConfirm();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
