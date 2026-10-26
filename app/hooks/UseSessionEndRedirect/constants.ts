/**
 * How long to wait before re-reading the session after a read that came up
 * inconclusive.
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
