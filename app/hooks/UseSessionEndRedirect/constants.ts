/**
 * Delays before the first re-reads of the session after a read that came up
 * inconclusive; once they are spent, re-reads settle to
 * `CONFIRM_RETRY_INTERVAL`.
 *
 * The common inconclusive read is a laptop wake, where the first fetch goes
 * out before the network is back and the network follows within seconds.
 * Waiting the full interval then leaves a blank page up for 30 seconds over a
 * blip; a few quick re-reads recover it almost as soon as the network does,
 * and a failure that outlasts them is no longer a blip.
 */
export const CONFIRM_RETRY_DELAYS = [1000, 2000, 5000] as const; // 1 s, 2 s, 5 s

/**
 * How long to wait between re-reads of the session once the quick
 * `CONFIRM_RETRY_DELAYS` are spent and reads are still inconclusive.
 *
 * A stranded page is unusable, and next-auth will not recover it: once its
 * client session is `null` the poll is gated off and the focus refetch bails,
 * so this retry is the only thing left that can right the tab. That is why it
 * is unbounded — giving up returns the tab to exactly the broken state this
 * hook exists to remove. Offline reads fail the same way, so this is also what
 * picks the tab up once the network returns after a laptop wake.
 *
 * Deliberately faster than `SESSION_REFETCH_INTERVAL`, which paces polls on a
 * *working* page where nothing is wrong. Here the user is looking at a blank
 * page, so the cost of a slow recovery is paid in full by them, while the cost
 * of a quick one is one small GET per tick. A retry never navigates on its own
 * account: only a read that returns an answer does.
 */
export const CONFIRM_RETRY_INTERVAL = 30 * 1000; // 30 seconds

/**
 * The endpoint the hook reads the session from.
 *
 * Read directly rather than through `getSession()`, because next-auth's
 * client returns `null` for an expired session, a non-OK response and a
 * network error alike — so it cannot say "the read failed". A test holds this
 * to the URL next-auth's client fetches, so the two cannot drift.
 */
export const SESSION_URL = "/api/auth/session";
