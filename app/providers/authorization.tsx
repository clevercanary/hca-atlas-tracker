import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { Main as DXMain } from "@databiosphere/findable-ui/lib/components/Layout/components/Main/main";
import { createContext, JSX, ReactNode, useEffect } from "react";
import {
  HCAAtlasTrackerActiveUser,
  ROLE,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { useFetchActiveUser } from "../hooks/UseFetchActiveUser/hook";
import { ROUTE } from "../routes/constants";

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
  const { isSettled, user } = useFetchActiveUser();
  const { disabled, role } = user || {};
  const isAuthorized = isUserAuthorized(role, disabled);

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
 * - When the user is unauthenticated (optimistically, whether or not auth
 *   state has settled). Unauthenticated pages don't fire authenticated data
 *   fetches, so rendering early is safe and avoids a first-load flash.
 * - When the user is authenticated, settled, and authorized.
 *
 * Falls through to a placeholder when the user is authenticated but not yet
 * settled, or settled and known to be unauthorized:
 * - `!isSettled`: the active-user fetch (`PUT /api/me`, which auto-registers
 *   first-time users) is still in flight. Holding back children until it
 *   resolves stops the target page from mounting and firing its own data
 *   fetch first — which on a deep link could otherwise reach the server
 *   before the `hat.users` row exists and get a 403 (see issue #1456).
 *   Tradeoff: if `PUT /api/me` stalls indefinitely this placeholder never
 *   clears; giving that fetch a timeout so a hang surfaces via the
 *   ErrorBoundary is tracked as a follow-up (issue #1460).
 * - `disabled`: the existing `useEffect` redirects them to
 *   `/account-disabled`.
 * - `UNREGISTERED`: no role yet, currently left as a blank placeholder;
 *   tracked as a follow-up so they're routed to a dedicated "awaiting
 *   access" page instead.
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
  return !isAuthenticated || (isSettled && isAuthorized);
}
