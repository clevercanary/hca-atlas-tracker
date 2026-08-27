import { useCurrentPath } from "@/app/hooks/UseCurrentPath/hook";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { useEffect } from "react";
import {
  claimSessionEndRedirect,
  isStrandedOnProtectedPath,
  leaveStrandedPage,
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
 * The tab that *initiates* an explicit sign-out never reaches this hook:
 * `signOut({ redirect: true })` hard-navigates via `window.location` without
 * updating that tab's session state, so `isAuthenticated` stays true until the
 * page is replaced. Sibling tabs are a different matter — next-auth's
 * localStorage broadcast does flip them to unauthenticated, so a deliberate
 * logout (or the disabled-account logout) in one tab sends the others here and
 * they land on the landing page with the inactivity banner. Leaving is still
 * correct for them; only the wording, and `/account-disabled` as a destination,
 * are lost. Distinguishing the two would need a trigger next-auth does not
 * expose to consumers.
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
    if (isAuthenticated) releaseSessionEndRedirect();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isStranded) return;
    if (!claimSessionEndRedirect()) return;
    return whenOnline(leaveStrandedPage);
  }, [isStranded]);
};
