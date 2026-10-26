export const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour

/**
 * Lifetime of the session JWT, and so how soon a session ends after the user
 * leaves.
 *
 * Requirement: once every tab is closed or the device sleeps, the session must
 * end within this time — not after the 1-hour `SESSION_TIMEOUT`, which only
 * runs while a tab is open. Browsers give the server no "last tab closed"
 * signal, so a short lifetime renewed by the client poll below is the way to
 * get that. The consequence is that a sleep longer than this wakes up signed
 * out under an open tab; `app/hooks/UseSessionEndRedirect` handles that.
 */
export const SESSION_MAX_AGE = 15 * 60 * 1000; // 15 minutes

/**
 * How often an open tab renews the session.
 *
 * Well under `SESSION_MAX_AGE` so that a throttled background tab or a
 * network blip costs a poll, not the session: the gap leaves a 10-minute
 * margin before an open tab's session can lapse.
 */
export const SESSION_REFETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes
