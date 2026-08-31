import { ROUTE } from "@/app/routes/constants";
import { PUBLIC_PATHS } from "@/app/routes/publicPaths";
import { AUTH_STATUS } from "@databiosphere/findable-ui/lib/auth/types/auth";
import { INACTIVITY_PARAM } from "@databiosphere/findable-ui/lib/hooks/authentication/session/useSessionTimeout";
import { getSession } from "next-auth/react";
import Router from "next/router";
import {
  MAX_REDIRECT_ATTEMPTS,
  REDIRECT_ATTEMPTS_KEY,
  SESSION_SEEN_KEY,
} from "./constants";
import { SESSION_CONFIRMATION, type SessionConfirmation } from "./types";

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
 * Why the allowance is more than a single attempt is documented on
 * `MAX_REDIRECT_ATTEMPTS`, and only there — stating it in both places is how
 * the two came to disagree.
 *
 * Falls back to allowing the attempt when storage is unavailable (private
 * mode, blocked site data): recovering the common case matters more than
 * guarding a rare one, and this is what the code did before the guard existed.
 * @returns true if this tab may navigate.
 */
export function claimSessionEndRedirect(): boolean {
  let spent: number;
  try {
    spent =
      Number.parseInt(
        window.sessionStorage.getItem(REDIRECT_ATTEMPTS_KEY) ?? "",
        10,
      ) || 0;
  } catch {
    // Storage unreadable (private mode, blocked site data): nothing can be
    // tracked, so allow the attempt — recovering the common case matters more
    // than guarding a rare one, and this is what the code did before the cap.
    return true;
  }
  if (spent >= MAX_REDIRECT_ATTEMPTS) return false;
  try {
    window.sessionStorage.setItem(REDIRECT_ATTEMPTS_KEY, String(spent + 1));
  } catch {
    // Readable but not writable (quota exhausted) is the dangerous asymmetry:
    // granting an attempt that cannot be recorded means every document load
    // reads zero and navigates again, which is exactly the unbounded loop the
    // cap exists to prevent. Refuse instead — a stranded page degrades to the
    // pre-fix behaviour, a loop does not.
    return false;
  }
  return true;
}

/**
 * Re-reads the session before a navigation is allowed to destroy page state.
 *
 * The reading that strands a page is not trustworthy on its own. next-auth's
 * `fetchData` returns `null` for *any* non-OK response or network error, which
 * `mapAuth` turns into settled-and-unauthenticated — indistinguishable from a
 * real expiry. So a single 502 on the 4-minute poll looks exactly like a logout,
 * and acting on it immediately throws away whatever the user was in the middle
 * of: ten minutes into a source-study form, one bad poll, `location.replace`,
 * contents gone. The self-heal makes that worse rather than better, since a
 * still-valid cookie lands them on `/atlases` rather than back at the form.
 *
 * A second reading turns a single blip into two consecutive failures, which is
 * a far smaller class of event.
 *
 * What this does NOT do is disambiguate a *resolved* `null`. `getSession()`
 * goes through the same `fetchData`, which returns `null` for a non-OK response
 * just as it does for a real expiry — so a persistently failing endpoint still
 * reads as `ENDED`. It is a second sample, not a different signal. Telling "no
 * session" apart from "the request failed" needs the response status, which
 * next-auth does not surface here; that is the deeper fix, and it is what would
 * let the attempt cap and its counter be deleted rather than merely made less
 * reachable. Tracked in #1562.
 *
 * A throw *is* distinguishable, and is reported as `INCONCLUSIVE` rather than
 * folded in with a live session. The two want opposite responses — retry versus
 * recover — and collapsing them into one falsy answer is what made a single
 * blip terminal.
 * @returns whether the session is confirmed gone, confirmed live, or unknown.
 */
export async function confirmSessionEnded(): Promise<SessionConfirmation> {
  try {
    return (await getSession()) === null
      ? SESSION_CONFIRMATION.ENDED
      : SESSION_CONFIRMATION.LIVE;
  } catch {
    // Threw rather than resolving: nothing was learned, so hold the page and
    // let the caller retry. Staying on a stale page is recoverable; navigating
    // away from unsaved work is not.
    return SESSION_CONFIRMATION.INCONCLUSIVE;
  }
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
  window.location.replace(getSessionEndUrl());
}

/**
 * Recovers a stranded page in place, by reloading the URL it is already on.
 *
 * For the case where the confirming read came back with a *live* session: the
 * client's `null` is then known-wrong, and the tab cannot correct it on its own
 * — next-auth gates its poll on a non-null session and its focus refetch bails
 * on a null one. Ironically the confirming `getSession()` broadcasts by
 * default, so sibling tabs are driven through the `storage` branch that does
 * write `__NEXTAUTH._session` and recover, while the tab that did the work
 * stays broken.
 *
 * Reloads rather than redirecting: the session was fine all along, so the user
 * belongs on the page they were already on, not at the landing page. A full
 * load is still required — it is what rebuilds the client session — and it
 * leaves no history entry to go back to a broken page through.
 *
 * Deliberately does not touch `SESSION_SEEN_KEY`: no session ended here, so
 * there is nothing to explain with the inactivity banner.
 * @returns void.
 */
export function reloadStrandedPage(): void {
  window.location.reload();
}

/**
 * Claims an attempt and, if granted, leaves the stranded page.
 *
 * The claim happens here rather than in the caller so the allowance is only
 * spent on navigations actually performed: a navigation deferred while offline
 * and then dropped when the page unmounts costs nothing, where claiming up
 * front could exhaust the allowance without ever having navigated and strand
 * the tab for good.
 * @returns void.
 */
export function attemptLeaveStrandedPage(): void {
  if (!claimSessionEndRedirect()) return;
  leaveStrandedPage();
}

/**
 * Claims an attempt and, if granted, reloads to recover a stranded page.
 *
 * Shares the allowance with `attemptLeaveStrandedPage` rather than reloading
 * freely. A reload lands a brand-new client whose own session fetch can fail
 * the same way the first one did, re-stranding the tab and confirming live
 * again — so an uncapped reload is the same unbounded document-load loop the
 * cap exists to bound, just reached by a different route.
 * @returns void.
 */
export function attemptReloadStrandedPage(): void {
  if (!claimSessionEndRedirect()) return;
  reloadStrandedPage();
}

/**
 * Returns where a stranded page should go: the app root, with the inactivity
 * param only when this tab has actually held a session.
 *
 * Read, not consumed. An earlier revision removed the flag here so the banner
 * could only appear once per session that ended, but the flag was then spent on
 * a navigation that shows no banner at all: on the self-heal path the root
 * page's `getServerSideProps` 307s a still-cookied request to `/atlases` and
 * drops the query string. If the session endpoint is still failing, that tab
 * re-strands and the next attempt lands on a bare root — the user's session
 * really is unusable at that point, and that is the moment they most need the
 * explanation.
 *
 * Nothing is lost by keeping it. A successful self-heal re-records the flag
 * anyway (see `recordSessionSeen`, called whenever an authenticated session is
 * observed), and after a genuine expiry the user sits on public paths where
 * `isStrandedOnProtectedPath` is false — so there is no later strand in the tab
 * for the banner to repeat on.
 * @returns Root URL, with the inactivity param when a session ended.
 */
export function getSessionEndUrl(): string {
  const rootUrl = getSessionRootUrl();
  try {
    if (!window.sessionStorage.getItem(SESSION_SEEN_KEY)) return rootUrl;
  } catch {
    // Storage unreadable; fall back to the plain root rather than asserting an
    // inactivity logout that may never have happened.
    return rootUrl;
  }
  // Set through `URLSearchParams`, as `useSessionCallbackUrl` does, so the
  // param survives however the root is spelled. Kept relative, so the caller
  // navigates within the app rather than to a pinned origin.
  const url = new URL(rootUrl, window.location.origin);
  url.searchParams.set(INACTIVITY_PARAM, "true");
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

/**
 * Records that this tab holds an authenticated session, so a later strand can
 * tell a session that ended from one that never existed.
 * @returns void.
 */
export function recordSessionSeen(): void {
  try {
    window.sessionStorage.setItem(SESSION_SEEN_KEY, "true");
  } catch {
    // Storage unavailable; `getSessionEndUrl` then omits the banner param,
    // which is the safe direction.
  }
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
