import { useCurrentPath } from "@/app/hooks/UseCurrentPath/hook";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { useEffect } from "react";
import { CONFIRM_RETRY_INTERVAL } from "./constants";
import { SESSION_CONFIRMATION, type SessionConfirmation } from "./types";
import {
  attemptLeaveStrandedPage,
  attemptReloadStrandedPage,
  confirmSessionEnded,
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
 * `MAX_REDIRECT_ATTEMPTS` itself for why the allowance is more than one.
 *
 * The confirming read is retried until it says something, because nothing else
 * can re-run this effect: `isStranded` is derived from auth state that is
 * frozen by now — next-auth gates its poll off once `_session === null` and its
 * focus refetch returns early — so a read that came up inconclusive would never
 * be followed by a second one, and one 502 or one failed fetch on laptop wake
 * was enough to strand the tab indefinitely. See `CONFIRM_RETRY_INTERVAL` for
 * why the retry is unbounded, and `attemptReloadStrandedPage` for the read that
 * comes back with a live session, where the client's `null` is known-wrong.
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
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let offlineCleanup: (() => void) | undefined;

    // Declared as a sibling of `attempt` and passed to `then` by reference
    // rather than inlined there, which keeps the nesting within limits.
    const onConfirmation = (confirmation: SessionConfirmation): void => {
      if (cancelled) return;
      switch (confirmation) {
        case SESSION_CONFIRMATION.ENDED:
          attemptLeaveStrandedPage();
          return;
        case SESSION_CONFIRMATION.LIVE:
          // The client's `null` is known-wrong, and the tab cannot correct it.
          attemptReloadStrandedPage();
          return;
        case SESSION_CONFIRMATION.INCONCLUSIVE:
          retryTimer = setTimeout(attempt, CONFIRM_RETRY_INTERVAL);
          return;
      }
    };

    // A fresh closure per attempt, never the module function itself:
    // `addEventListener` dedupes on (type, listener, capture), so passing a
    // singleton would collapse two mounts into one listener and let the first
    // cleanup unregister it for the other — leaving that one stranded offline
    // for good. Re-entering `whenOnline` per attempt is also what re-arms its
    // `{ once: true }` listener: `online` fires on interface-up, not on
    // reachability, so the read that follows a laptop wake commonly fails and
    // the deferral must not be spent on it.
    //
    // The attempt allowance is claimed at navigation time, not here — a
    // deferred navigation dropped on unmount must not spend it.
    // `confirmSessionEnded` swallows its own failures, so this never rejects
    // and needs no catch.
    function attempt(): void {
      offlineCleanup = whenOnline(() => {
        confirmSessionEnded().then(onConfirmation);
      });
    }

    attempt();

    return (): void => {
      cancelled = true;
      clearTimeout(retryTimer);
      offlineCleanup?.();
    };
  }, [isStranded]);
};
