import {
  type HCAAtlasTrackerActiveUser,
  ROLE,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { useFetchActiveUser } from "@/app/hooks/UseFetchActiveUser/hook";
import { useIsomorphicLayoutEffect } from "@/app/hooks/useIsomorphicLayoutEffect";
import { useSessionEndRedirect } from "@/app/hooks/UseSessionEndRedirect/hook";
import { ROUTE } from "@/app/routes/constants";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { Main as DXMain } from "@databiosphere/findable-ui/lib/components/Layout/components/Main/main";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, type JSX, type ReactNode, useEffect } from "react";

export interface AuthorizationContextProps {
  user?: HCAAtlasTrackerActiveUser;
}

export const AuthorizationContext = createContext<AuthorizationContextProps>(
  {},
);

interface Props {
  children: ReactNode | ReactNode[];
}

export function AuthorizationProvider({ children }: Props): JSX.Element {
  const {
    authState: { isAuthenticated },
    service,
  } = useAuth();
  const queryClient = useQueryClient();
  const { isSettled, user } = useFetchActiveUser();
  const { disabled, role } = user || {};
  const isAuthorized = isUserAuthorized(role, disabled);

  // A session that ends without a `signOut` call (passive JWT expiry) leaves
  // this provider rendering `children` on a protected URL with the query cache
  // already cleared below — a blank page. Navigate out so middleware re-runs.
  useSessionEndRedirect();

  // Clear the React Query cache when the user becomes unauthenticated. The
  // QueryClient is created once in _app and survives client-side logout
  // (which navigates without a hard reload), and `enabled: false` only stops
  // fetching — it doesn't evict cached data. Without this, a subsequent login
  // (e.g. a different user on a shared machine) could briefly be served the
  // previous session's cached data. Runs in an isomorphic layout effect so the
  // clear happens before paint on the client: React Query preserves cached data
  // across the `enabled: false` flip, so a plain effect would let the logout
  // render briefly paint the prior session's data before clearing. Restores the
  // pre-React-Query behavior where useFetchData reset its data on logout.
  useIsomorphicLayoutEffect(() => {
    if (!isAuthenticated) queryClient.clear();
  }, [isAuthenticated, queryClient]);

  useEffect(() => {
    if (disabled) {
      service?.requestLogout({
        callbackUrl: ROUTE.ACCOUNT_DISABLED,
        redirect: true,
      });
    }
  }, [role, disabled, service]);

  return (
    <AuthorizationContext.Provider
      value={{ user: isAuthenticated ? user : undefined }} // TODO(cc) - we should reset / clear user when not authenticated see useFetchActiveUser.
    >
      {shouldRenderComponents(isSettled, isAuthenticated, isAuthorized) ? (
        children
      ) : (
        <DXMain>{null}</DXMain>
      )}
    </AuthorizationContext.Provider>
  );
}

/**
 * Returns true if the user is authorized.
 * @param role - User's role.
 * @param disabled - Whether the user's account is disabled.
 * @returns true if the user is authorized.
 */
function isUserAuthorized(role?: ROLE, disabled?: boolean): boolean {
  if (!role || disabled) return false;
  return role !== ROLE.UNREGISTERED;
}

/**
 * Returns true if components should be rendered.
 *
 * Renders children:
 * - While auth/user state is still resolving (optimistic; a brief render
 *   before the disabled-user redirect fires is acceptable). This is what
 *   stops the disappear → reappear flash for authenticated users on first
 *   load — previously the UI would render, collapse while the user fetch
 *   was in flight, then re-render once the role landed.
 * - When the user is unauthenticated.
 * - When the user is authenticated and authorized.
 *
 * Falls through to a placeholder when the user is authenticated and known
 * to be unauthorized — i.e. `disabled` (the existing `useEffect` redirects
 * them to `/account-disabled`) OR `UNREGISTERED` (no role yet, currently
 * left as a blank placeholder; tracked as a follow-up so they're routed to
 * a dedicated "awaiting access" page instead).
 * @param isSettled - Auth and (if authenticated) user fetch are both resolved.
 * @param isAuthenticated - User's authentication status.
 * @param isAuthorized - User's authorization status.
 * @returns true if the components should be rendered.
 */
function shouldRenderComponents(
  isSettled: boolean,
  isAuthenticated: boolean,
  isAuthorized: boolean,
): boolean {
  return !isSettled || !isAuthenticated || isAuthorized;
}
