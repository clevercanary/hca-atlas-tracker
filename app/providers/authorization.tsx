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
