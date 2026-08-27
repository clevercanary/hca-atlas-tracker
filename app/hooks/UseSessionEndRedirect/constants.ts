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
 * Must be storage rather than component state: an attempt is a full document
 * load, so nothing in memory survives to the other side to notice it happened.
 */
export const REDIRECT_ATTEMPTS_KEY = "hat.sessionEndRedirectAttempts";

/**
 * How many times one tab may try to leave a stranded page before an
 * authenticated session resets the count.
 *
 * A cap rather than a single shot: it bounds a reload loop to something
 * harmless while still rescuing a user who presses Back onto an earlier
 * protected page, which `sessionStorage` alone cannot distinguish from a loop.
 */
export const MAX_REDIRECT_ATTEMPTS = 3;
