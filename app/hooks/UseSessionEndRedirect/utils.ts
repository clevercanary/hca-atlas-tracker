import { PUBLIC_PATHS } from "@/app/routes/publicPaths";
import { AUTH_STATUS } from "@databiosphere/findable-ui/lib/auth/types/auth";
import {
  MAX_REDIRECT_ATTEMPTS,
  REDIRECT_ATTEMPTS_KEY,
  SESSION_END_URL,
} from "./constants";

/**
 * Claims one of this tab's attempts at leaving a stranded page, returning false
 * once `MAX_REDIRECT_ATTEMPTS` are spent.
 *
 * This is the loop breaker. The client reports no session on *any* failed
 * `/api/auth/session` request, and if that endpoint fails while page requests
 * keep succeeding, every recovery attempt lands somewhere that strands the tab
 * again: `getServerSession` reads the cookie directly, so the landing page
 * bounces a still-cookied request back to `/atlases`, whose fresh client has
 * `_session === undefined` and so re-fetches, re-fails, and navigates once
 * more — an unbounded reload loop against the origin. That asymmetry is not
 * hypothetical here; `proxy.ts` documents a CDN misconfiguration that split
 * cookie forwarding between page and API routes in the mirror direction.
 *
 * Counting failed polls within one page cannot bound this, because each attempt
 * is a full document load with a brand-new client; the count has to outlive the
 * navigation, hence `sessionStorage`. Exhausting it degrades a persistent
 * failure to the pre-fix behaviour — a stranded page — rather than a loop.
 *
 * A small cap rather than a single attempt, because `replace` removes the
 * stranded URL from history but not any *earlier* protected page: a user who
 * presses Back onto one needs rescuing too, and that is indistinguishable from
 * a loop iteration. A cap serves both — a loop stops after a few harmless
 * bounces, and Back keeps working.
 *
 * Falls back to allowing the attempt when storage is unavailable (private
 * mode, blocked site data): recovering the common case matters more than
 * guarding a rare one, and this is what the code did before the guard existed.
 * @returns true if this tab may navigate.
 */
export function claimSessionEndRedirect(): boolean {
  try {
    const spent =
      Number.parseInt(
        window.sessionStorage.getItem(REDIRECT_ATTEMPTS_KEY) ?? "",
        10,
      ) || 0;
    if (spent >= MAX_REDIRECT_ATTEMPTS) return false;
    window.sessionStorage.setItem(REDIRECT_ATTEMPTS_KEY, String(spent + 1));
  } catch {
    return true;
  }
  return true;
}

/**
 * Returns true if the app is stranded: sitting on a protected page with no
 * session, and therefore rendering nothing the user can act on.
 *
 * Requires a settled status — while auth is `PENDING` the state is
 * indistinguishable from a logged-out visitor, and redirecting then would
 * bounce authenticated users off protected pages on every first load.
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
 * Must be a full load, not `Router.push`. The client reports no session on
 * *any* failed `/api/auth/session` request — next-auth's `fetchData` swallows
 * offline errors and non-OK responses alike and returns `null` — so "stranded"
 * can mean the cookie expired OR that a poll merely failed while the cookie is
 * fine. A soft push cannot tell those apart and gets the second case badly
 * wrong: client navigations skip middleware, and the landing page's
 * `getServerSideProps` redirects a request that still carries a session back to
 * `/atlases`, all without remounting `SessionProvider`. The client session
 * would stay `null` forever — the poll is gated on a non-null session and the
 * focus refetch bails on a null one — leaving a stripped header, an empty query
 * cache and a sticky inactivity banner on a session that never actually ended.
 *
 * A full load resolves both cases correctly: an expired cookie renders the
 * landing page with the banner, and a still-valid cookie lands the user back on
 * a working authenticated page with a freshly fetched session.
 *
 * `replace`, not `assign`, so the expired URL leaves no history entry. The page
 * is bfcache-eligible (nothing in `app/` or `pages/` registers an `unload`
 * handler), so Back would restore it with React state intact — `isStranded`
 * still true and the effect's dependency unchanged, so nothing would fire
 * again, and next-auth cannot right itself either. That is precisely the
 * stranded state this hook exists to remove.
 * @returns void.
 */
export function leaveStrandedPage(): void {
  window.location.replace(SESSION_END_URL);
}

/**
 * Resets this tab's attempt count, so a later genuine expiry can navigate.
 *
 * Called whenever an authenticated session is observed — exactly the signal
 * that the previous attempt worked, or that none is outstanding. A tab stuck in
 * the failed-poll case never observes one, so its count stays exhausted and the
 * loop stays bounded.
 * @returns void.
 */
export function releaseSessionEndRedirect(): void {
  try {
    window.sessionStorage.removeItem(REDIRECT_ATTEMPTS_KEY);
  } catch {
    // Storage unavailable; nothing was counted to reset.
  }
}

/**
 * Runs `navigate` now if the browser is online, otherwise defers it to the next
 * `online` event.
 *
 * Offline is a leading cause of the failed session poll that strands the page
 * in the first place, and navigating while offline would only swap the stranded
 * page for the browser's network error page.
 * @param navigate - Navigation to run once the browser is online.
 * @returns Cleanup for a deferred navigation, or undefined if it already ran.
 */
export function whenOnline(navigate: () => void): (() => void) | undefined {
  if (navigator.onLine) {
    navigate();
    return undefined;
  }
  window.addEventListener("online", navigate, { once: true });
  return () => window.removeEventListener("online", navigate);
}
