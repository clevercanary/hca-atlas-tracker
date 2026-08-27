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
