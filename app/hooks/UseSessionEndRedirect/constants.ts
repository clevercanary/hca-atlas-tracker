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
 * An earlier revision justified the allowance being greater than one by
 * rescuing a user who presses Back onto an earlier protected page, treating
 * that as indistinguishable from a loop iteration. That framing was wrong, and
 * `leaveStrandedPage`'s own reasoning is why: restoring a page that was
 * *already* stranded re-fires nothing, because React state comes back with it —
 * `isStranded` is still true and the effect's dependency unchanged, which is
 * exactly why `replace` is used over `assign`. On a bfcache miss the document
 * reloads and `proxy.ts` redirects without this hook at all.
 *
 * A narrower version does hold, and it is the reason the allowance is not one.
 * A page bfcached while still *authenticated* comes back believing it holds a
 * session, and its next poll flips it — so Back after a deliberate sign-out
 * (see the hook's JSDoc) legitimately spends an attempt, and a cap of one would
 * strand the second such page. That is the only Back case that costs anything.
 *
 * `confirmSessionEnded` makes reaching the cap much less likely, and removing
 * it altogether is part of #1562.
 */
export const MAX_REDIRECT_ATTEMPTS = 3;

/**
 * How long to wait before re-reading the session after a read that came up
 * inconclusive.
 *
 * A stranded page is unusable, and next-auth will not recover it: once its
 * client session is `null` the poll is gated off and the focus refetch bails,
 * so this retry is the only thing left that can right the tab. That is why it
 * is unbounded — giving up returns the tab to exactly the broken state this
 * hook exists to remove.
 *
 * Deliberately faster than `SESSION_REFETCH_INTERVAL` (4 minutes), which paces
 * polls on a *working* page where nothing is wrong. Here the user is looking at
 * a blank page, so the cost of a slow recovery is paid in full by them, while
 * the cost of a quick one is one small GET per tick. The destructive half —
 * navigating away — stays bounded by `MAX_REDIRECT_ATTEMPTS` regardless of how
 * many times the read is retried.
 */
export const CONFIRM_RETRY_INTERVAL = 30 * 1000; // 30 seconds

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
