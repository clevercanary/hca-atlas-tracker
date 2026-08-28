import { useCurrentPath } from "@/app/hooks/UseCurrentPath/hook";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { useEffect } from "react";
import {
  attemptLeaveStrandedPage,
  isStrandedOnProtectedPath,
  recordSessionSeen,
  releaseSessionEndRedirect,
  whenOnline,
} from "./utils";

/**
 * Leaves the page when the session ends while a protected page is open.
 *
 * The auth gate is middleware-only, and middleware runs on navigation — so a
 * session that ends *without* one leaves the page mounted on a protected URL
 * with its query cache evicted and nothing to bounce the user forward. The
 * main way in is passive expiry: the JWT hits `SESSION_MAX_AGE` because the
 * refetch poll was interrupted (laptop sleep, offline, a throttled background
 * tab), `useSession` reports no session on the next poll, and no `signOut`
 * ever runs. Recovery has to come from here, because once next-auth's client
 * session is `null` it stops polling and its focus refetch bails — the tab
 * cannot right itself.
 *
 * An explicit sign-out does not route through here *at the moment it happens*:
 * `signOut({ redirect: true })` hard-navigates via `window.location` without
 * updating that tab's session state, so `isAuthenticated` stays true until the
 * page is replaced. It can still arrive later, by two routes, and in both the
 * inactivity wording is wrong even though leaving is right:
 * - sibling tabs, which next-auth's localStorage broadcast does flip to
 *   unauthenticated, so a deliberate logout (or the disabled-account logout) in
 *   one tab sends the others here — losing `/account-disabled` as a
 *   destination in that second case;
 * - pressing Back onto a bfcached protected page after signing out, where the
 *   restored page still believes it is authenticated until its next poll.
 * Telling these apart from a passive expiry would need a trigger next-auth does
 * not expose to consumers.
 *
 * A visitor who has *never* held a session is a different case, and one this
 * hook does distinguish: see `SESSION_SEEN_KEY`. They are still moved off a
 * protected path, but without being told a session of theirs expired.
 *
 * Recovery is capped at `MAX_REDIRECT_ATTEMPTS` per authenticated session — see
 * `claimSessionEndRedirect` for the reload loop that cap exists to prevent, and
 * why it is a small allowance rather than a single attempt.
 * @returns void.
 */
export const useSessionEndRedirect = (): void => {
  const {
    authState: { isAuthenticated, status },
  } = useAuth();
  const pathname = useCurrentPath();
  const isStranded = isStrandedOnProtectedPath(
    status,
    isAuthenticated,
    pathname,
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    releaseSessionEndRedirect();
    recordSessionSeen();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isStranded) return;
    // The attempt is claimed at navigation time, not here — a deferred
    // navigation dropped on unmount must not spend the allowance.
    return whenOnline(attemptLeaveStrandedPage);
  }, [isStranded]);
};
