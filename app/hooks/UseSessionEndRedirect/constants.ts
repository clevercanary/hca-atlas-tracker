import { ROUTE } from "@/app/routes/constants";
import { INACTIVITY_PARAM } from "@databiosphere/findable-ui/lib/hooks/authentication/session/useSessionTimeout";

/**
 * Destination for a session that ended without a `signOut` call.
 *
 * Built from findable-ui's `INACTIVITY_PARAM` rather than a literal so it
 * cannot drift from the param `useSessionTimeout` reads to raise the
 * inactivity banner, and matches what the idle timer's `useSessionCallbackUrl`
 * produces — both session-end paths therefore land the same way.
 */
export const SESSION_END_URL = `${ROUTE.LANDING}?${INACTIVITY_PARAM}=true`;

/**
 * `sessionStorage` key counting this tab's attempts at leaving a stranded page.
 *
 * Shares the `hat.sessionEndRedirect.` namespace with `SESSION_SEEN_KEY` so
 * this hook's storage can be found and cleared as a group.
 * Must be storage rather than component state: an attempt is a full document
 * load, so nothing in memory survives to the other side to notice it happened.
 */
export const REDIRECT_ATTEMPTS_KEY = "hat.sessionEndRedirect.attempts";

/**
 * How many times one tab may try to leave a stranded page before an
 * authenticated session resets the count.
 *
 * The cap exists for one reason: to bound the cookie-valid / session-endpoint-
 * failing loop, where every recovery lands somewhere that strands the tab again
 * (see `claimSessionEndRedirect`).
 *
 * An earlier revision also justified the allowance being greater than one by
 * rescuing a user who presses Back onto an earlier protected page. That does
 * not hold, and `leaveStrandedPage`'s own reasoning is why: on a bfcache hit
 * the page is restored with React state intact, so `isStranded` is already true
 * and the effect's dependency is unchanged — nothing re-fires; on a miss the
 * document reloads and `proxy.ts` redirects without this hook. Back never
 * spends an attempt either way.
 *
 * So the number is a small tolerance for repeated genuine strands in one tab,
 * not a load-bearing rescue. Three rather than one only trades a few extra
 * document loads against giving up permanently after a single unlucky
 * recovery. `confirmSessionEnded` now makes reaching the cap much less likely,
 * and removing it altogether is part of #1562.
 */
export const MAX_REDIRECT_ATTEMPTS = 3;

/**
 * `sessionStorage` key recording that this tab has held an authenticated
 * session, so a session that *ends* can be told apart from one that never
 * existed.
 *
 * Without it a visitor who has never logged in can be shown the inactivity
 * banner: client navigations and any URL containing a dot skip the auth
 * middleware (see `proxy.ts`'s matcher), so a logged-out visitor reaching, say,
 * `/foo.html` renders 404 through `_app`, settles unauthenticated on a
 * non-public path, and gets told they were logged out after inactivity they
 * never had. Leaving is still right for them; the message is not.
 */
export const SESSION_SEEN_KEY = "hat.sessionEndRedirect.sessionSeen";
