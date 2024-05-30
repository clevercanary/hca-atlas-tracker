import { Main as DXMain } from "@databiosphere/findable-ui/lib/components/Layout/components/Main/main";
import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { createContext, ReactNode, useEffect } from "react";
import {
  HCAAtlasTrackerActiveUser,
  ROLE,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { useFetchUser } from "../hooks/useFetchUser";
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
  const { isAuthenticated } = useAuthentication();
  const user = useFetchUser();
  const { role } = user || {};
  const isAuthorized = isUserAuthorized(role);

  useEffect(() => {
    if (role === ROLE.UNREGISTERED) {
      location.href = ROUTE.REGISTRATION_REQUIRED;
    }
  }, [role]);

  return (
    <AuthorizationContext.Provider value={{ user }}>
      {shouldRenderComponents(isAuthenticated, isAuthorized) ? (
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
 * @returns true if the user is authorized.
 */
function isUserAuthorized(role?: ROLE): boolean {
  if (!role) return false;
  return role !== ROLE.UNREGISTERED;
}

/**
 * Returns true if components should be rendered:
 * - When user is not authenticated.
 * - When user is authenticated and authorized.
 * @param isAuthenticated - User's authentication status.
 * @param isAuthorized - User's authorization status.
 * @returns true if the components should be rendered.
 */
function shouldRenderComponents(
  isAuthenticated: boolean,
  isAuthorized: boolean
): boolean {
  return !isAuthenticated || isAuthorized;
}
