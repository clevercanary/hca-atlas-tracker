import { PUBLIC_PATHS } from "@/app/routes/publicPaths";
import { AUTH_STATUS } from "@databiosphere/findable-ui/lib/auth/types/auth";
import { SESSION_END_URL } from "./constants";

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
 * Leaves the stranded page by a full document load.
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
 * @returns void.
 */
export function leaveStrandedPage(): void {
  window.location.assign(SESSION_END_URL);
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
