import { ROUTE, SESSION_END_PARAM } from "@/app/routes/constants";
import { PUBLIC_PATHS } from "@/app/routes/publicPaths";
import { AUTH_STATUS } from "@databiosphere/findable-ui/lib/auth/types/auth";
import { INACTIVITY_PARAM } from "@databiosphere/findable-ui/lib/hooks/authentication/session/useSessionTimeout";
import Router from "next/router";
import { SESSION_URL } from "./constants";
import { SESSION_CONFIRMATION, type SessionConfirmation } from "./types";

/**
 * Re-reads the session before a navigation is allowed to destroy page state.
 *
 * The reading that strands a page is not trustworthy on its own. next-auth's
 * `fetchData` returns `null` for *any* non-OK response or network error, which
 * `mapAuth` turns into settled-and-unauthenticated — indistinguishable from a
 * real expiry. So a single 502 on the poll, or a poll on laptop wake before the
 * network is back, looks exactly like a logout.
 *
 * Reading the endpoint directly keeps the response status, which is what tells
 * those apart. The classification mirrors next-auth's own: an OK response whose
 * body is an object with keys is a session, and an OK empty object is none.
 * Anything else — a non-OK status, a failed fetch (including offline), or a body
 * that is not a JSON object — says nothing about the session, and is reported
 * as `INCONCLUSIVE` so the caller holds the page and retries.
 * @returns whether the session is confirmed gone, confirmed live, or unknown.
 */
export async function confirmSessionEnded(): Promise<SessionConfirmation> {
  let body: unknown;
  try {
    const response = await fetch(SESSION_URL);
    if (!response.ok) return SESSION_CONFIRMATION.INCONCLUSIVE;
    body = await response.json();
  } catch {
    // The fetch failed or the body was not JSON: nothing was learned.
    return SESSION_CONFIRMATION.INCONCLUSIVE;
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return SESSION_CONFIRMATION.INCONCLUSIVE;
  }
  return Object.keys(body).length > 0
    ? SESSION_CONFIRMATION.LIVE
    : SESSION_CONFIRMATION.ENDED;
}

/**
 * Returns true if the app is stranded: sitting on a protected page with no
 * session, and therefore rendering nothing the user can act on.
 *
 * Requires a settled status — while auth is `PENDING` the state is
 * indistinguishable from a logged-out visitor, and redirecting then would
 * bounce authenticated users off protected pages on every first load.
 *
 * The page a session end lands on is `ROUTE.LANDING`, which `PUBLIC_PATHS`
 * contains — so arriving there cannot re-fire the hook. A test pins that
 * invariant rather than a runtime guard restating it.
 * @param status - Auth status (pending until the session has settled).
 * @param isAuthenticated - User's authentication status.
 * @param pathname - Canonical current pathname.
 * @returns true if the session is gone on a path that requires one.
 */
export function isStrandedOnProtectedPath(
  status: AUTH_STATUS,
  isAuthenticated: boolean,
  pathname: string,
): boolean {
  if (status !== AUTH_STATUS.SETTLED) return false;
  if (isAuthenticated) return false;
  return !PUBLIC_PATHS.has(pathname);
}

/**
 * Leaves the stranded page by a full document load, replacing it in history.
 *
 * Must be a full load, not `Router.push`: client navigations skip middleware
 * and do not remount `SessionProvider`, so a soft push would leave next-auth's
 * client session `null` with nothing able to refetch it.
 *
 * `replace`, not `assign`, so the expired URL leaves no history entry. The page
 * is bfcache-eligible (nothing in `app/` or `pages/` registers an `unload`
 * handler), so Back would restore it with React state intact — `isStranded`
 * still true and the effect's dependency unchanged, so nothing would fire
 * again. That is precisely the stranded state this hook exists to remove.
 * @param url - Destination, from `getSessionEndUrl`.
 * @returns void.
 */
export function leaveStrandedPage(url: string): void {
  window.location.replace(url);
}

/**
 * Recovers a stranded page in place, by reloading the URL it is already on.
 *
 * For the case where the confirming read came back with a *live* session: the
 * client's `null` is then known-wrong, and the tab cannot correct it on its own
 * — next-auth gates its poll on a non-null session and its focus refetch bails
 * on a null one. A reload rebuilds the client session and keeps the user on the
 * page they were on.
 *
 * Not capped. Every reload follows a read that saw a live session, so a loop
 * would need the endpoint to keep alternating between failing and succeeding —
 * and each turn of it is paced by that, not by this code.
 * @returns void.
 */
export function reloadStrandedPage(): void {
  window.location.reload();
}

/**
 * Returns where a stranded page should go: the app root, with the inactivity
 * param when this document has held a session and the banner-free
 * `SESSION_END_PARAM` otherwise.
 *
 * The inactivity banner is only true of a session that *ended*, so a visitor
 * who never held one — a logged-out visitor reaching a dot path, which skips
 * the auth middleware — is moved without it. They still get a param: either one
 * stops the landing page redirecting a still-cookied request back to
 * `/atlases`, which is what keeps a recovery from looping.
 * @param hasHeldSession - Whether this document has been authenticated.
 * @returns Root URL, with the param for how the session ended.
 */
export function getSessionEndUrl(hasHeldSession: boolean): string {
  // Set through `URLSearchParams`, as `useSessionCallbackUrl` does, so the
  // param survives however the root is spelled. Kept relative, so the caller
  // navigates within the app rather than to a pinned origin.
  const url = new URL(getSessionRootUrl(), window.location.origin);
  url.searchParams.set(
    hasHeldSession ? INACTIVITY_PARAM : SESSION_END_PARAM,
    "true",
  );
  return `${url.pathname}${url.search}`;
}

/**
 * Returns the app root for a full document load: `ROUTE.LANDING`, prefixed with
 * any `basePath`.
 *
 * Two things end a session and they must land the same way: findable-ui's
 * 1-hour idle timer navigates to `useSessionCallbackUrl()`, while a passive
 * expiry comes through here. That hook builds `basePath` + the config's
 * `redirectRootToPath`, and the config sets `redirectRootToPath: ROUTE.LANDING`
 * — so naming the same constant here is what keeps the two in step. Change
 * `ROUTE.LANDING` and every session-end destination moves with it; point
 * `redirectRootToPath` at anything else and the drift test fails.
 *
 * The `basePath` prefix is not optional: `location.replace` acts on the
 * document URL, which router-relative paths like `asPath` omit. It is read off
 * the singleton rather than `useRouter()` because this runs from a plain
 * function at navigation time, not a hook. `Router.router` is null until the
 * router initializes — unreachable from this module, which only runs from an
 * effect inside a mounted `_app` — so `?? ""` just keeps the read total.
 * @returns App root path, including any `basePath`.
 */
export function getSessionRootUrl(): string {
  return `${Router.router?.basePath ?? ""}${ROUTE.LANDING}`;
}
