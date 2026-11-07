import { useCurrentPath } from "@/app/hooks/UseCurrentPath/hook";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { useEffect, useRef } from "react";
import { CONFIRM_RETRY_INTERVAL } from "./constants";
import { SESSION_CONFIRMATION, type SessionConfirmation } from "./types";
import {
  confirmSessionEnded,
  getSessionEndUrl,
  isStrandedOnProtectedPath,
  leaveStrandedPage,
  reloadStrandedPage,
} from "./utils";

/**
 * Leaves the page when the session ends while a protected page is open.
 *
 * The auth gate is middleware-only, and middleware runs on document requests —
 * so a session that ends *without* one leaves the page mounted on a protected
 * URL with its query cache evicted and nothing to bounce the user forward. The
 * main way in is passive expiry: the device slept (or every poll was otherwise
 * interrupted) for longer than `SESSION_MAX_AGE`, `useSession` reports no
 * session on the next poll, and no `signOut` ever runs. Recovery has to come
 * from here, because once next-auth's client session is `null` it stops polling
 * and its focus refetch bails — the tab cannot right itself.
 *
 * Because next-auth's client reports no session on a failed read too, the hook
 * re-reads the endpoint itself before acting (see `confirmSessionEnded`):
 * - `ENDED` leaves for the landing page, replacing the history entry;
 * - `LIVE` reloads in place, since the client's `null` was wrong;
 * - `INCONCLUSIVE` holds the page and reads again after
 *   `CONFIRM_RETRY_INTERVAL`, until one of the other two comes back.
 *
 * The inactivity banner is shown only if this document has been authenticated,
 * which is tracked in memory: a visitor who never held a session, or who
 * signed out deliberately (a full load, so a fresh document), is moved without
 * being told a session of theirs expired. Sibling tabs after a deliberate
 * sign-out, and a bfcached page restored with Back after one, did hold a
 * session, so they show the banner — an accepted limitation.
 *
 * Each tab recovers itself: reading the endpoint directly does not post
 * next-auth's cross-tab broadcast the way `getSession()` does.
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
  const hasHeldSessionRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated) hasHeldSessionRef.current = true;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isStranded) return;
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const onConfirmation = (confirmation: SessionConfirmation): void => {
      if (cancelled) return;
      switch (confirmation) {
        case SESSION_CONFIRMATION.ENDED:
          leaveStrandedPage(getSessionEndUrl(hasHeldSessionRef.current));
          return;
        case SESSION_CONFIRMATION.LIVE:
          // The client's `null` is known-wrong, and the tab cannot correct it.
          reloadStrandedPage();
          return;
        case SESSION_CONFIRMATION.INCONCLUSIVE:
          retryTimer = setTimeout(attempt, CONFIRM_RETRY_INTERVAL);
          return;
      }
    };

    // `confirmSessionEnded` swallows its own failures, so this never rejects
    // and needs no catch.
    function attempt(): void {
      confirmSessionEnded().then(onConfirmation);
    }

    attempt();

    return (): void => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, [isStranded]);
};
