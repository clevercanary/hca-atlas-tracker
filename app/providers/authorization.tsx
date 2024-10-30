import { Main as DXMain } from "@databiosphere/findable-ui/lib/components/Layout/components/Main/main";
import { useAuth } from "@databiosphere/findable-ui/lib/providers/authentication/auth/hook";
import { createContext, ReactNode, useEffect } from "react";
import { AuthState } from "../../../findable-ui/lib/providers/authentication/auth/types";
import { AUTH_STATUS } from "../../../findable-ui/src/providers/authentication/auth/types";
import {
  HCAAtlasTrackerActiveUser,
  ROLE,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { useFetchActiveUser } from "../hooks/useFetchActiveUser";
import { ROUTE } from "../routes/constants";

export interface AuthorizationContextProps {
  user?: HCAAtlasTrackerActiveUser;
}

export const AuthorizationContext = createContext<AuthorizationContextProps>(
  {}
);

interface Props {
  children: ReactNode | ReactNode[];
}

export function AuthorizationProvider({ children }: Props): JSX.Element {
  const { authState, service } = useAuth();
  const user = useFetchActiveUser();
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
    <AuthorizationContext.Provider value={{ user }}>
      {shouldRenderComponents(authState, isAuthorized) ? (
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
 * Returns true if components should be rendered:
 * - When user is not authenticated.
 * - When user is authenticated and authorized.
 * @param authState - Auth state.
 * @param isAuthorized -- Whether the user is authorized.
 * @returns true if the components should be rendered.
 */
function shouldRenderComponents(
  authState: AuthState,
  isAuthorized: boolean
): boolean {
  if (authState.status === AUTH_STATUS.PENDING) return false;
  return !authState.isAuthenticated || isAuthorized;
}
