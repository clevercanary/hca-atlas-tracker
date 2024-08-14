import { AUTHENTICATION_STATUS } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/common/entities";
import { useConfig } from "@databiosphere/findable-ui/lib/hooks/useConfig";
import { INACTIVITY_PARAM } from "@databiosphere/findable-ui/lib/hooks/useSessionTimeout";
import { Session } from "next-auth";
import { signIn, signOut, useSession } from "next-auth/react";
import Router, { useRouter } from "next/router";
import { createContext, ReactNode, useCallback } from "react";
import { useIdleTimer } from "react-idle-timer";
import { useAuthenticationRedirectRoute } from "../hooks/useAuthenticationRedirectRoute";

// Template constants
export const ROUTE_LOGIN = "/login";

type AuthenticateUserFn = (providerId: string) => void;
type RequestAuthenticationFn = () => void;

/**
 * Model of authentication context.
 */
export interface AuthContextProps {
  authenticateUser: AuthenticateUserFn;
  authenticationStatus: AUTHENTICATION_STATUS;
  isAuthenticated: boolean;
  isEnabled: boolean;
  requestAuthentication: RequestAuthenticationFn;
  userProfile?: Session["user"];
}

/**
 * Auth context for storing and using auth-related state.
 */
export const AuthContext = createContext<AuthContextProps>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- allow dummy function for default state.
  authenticateUser: () => {},
  authenticationStatus: AUTHENTICATION_STATUS.INCOMPLETE,
  isAuthenticated: false,
  isEnabled: true,
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- allow dummy function for default state.
  requestAuthentication: () => {},
  userProfile: undefined,
});

interface Props {
  children: ReactNode | ReactNode[];
  sessionTimeout?: number;
}

/**
 * Auth provider for consuming components to subscribe to changes in auth-related state.
 * @param props - Component inputs.
 * @param props.children - Set of children components that can possibly consume the query provider.
 * @param props.sessionTimeout - If provided, will set the value for a session timeout (in milliseconds).
 * @returns Provider element to be used by consumers to both update authentication state and subscribe to changes in authentication state.
 */
export function AuthProvider({ children, sessionTimeout }: Props): JSX.Element {
  const { config } = useConfig();
  const { authentication, redirectRootToPath } = config;
  const { basePath } = useRouter();
  const isEnabled = Boolean(authentication);
  const sessionInfo = useSession();
  const isAuthenticated = sessionInfo.status === "authenticated";
  const authenticationStatus = isAuthenticated
    ? AUTHENTICATION_STATUS.COMPLETED
    : AUTHENTICATION_STATUS.INCOMPLETE;
  const redirectRoute = useAuthenticationRedirectRoute();

  /**
   * If sessionTimeout is set and user is authenticated, the app will reload and redirect to
   * origin, including base path, root path, and query param.
   */
  useIdleTimer({
    onIdle: () =>
      isAuthenticated &&
      sessionTimeout &&
      signOut({
        callbackUrl:
          window.location.origin +
          basePath +
          redirectRootToPath +
          "?" +
          `${INACTIVITY_PARAM}=true`,
      }),
    timeout: sessionTimeout,
  });

  /**
   * Authenticates user and redirects to previous page.
   */
  const authenticateUser = useCallback(
    (providerId: string): void => {
      signIn(providerId, { callbackUrl: redirectRoute });
    },
    [redirectRoute]
  );

  /**
   * Navigates to login page.
   */
  const requestAuthentication = useCallback((): void => {
    Router.push(ROUTE_LOGIN);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authenticateUser,
        authenticationStatus,
        isAuthenticated,
        isEnabled,
        requestAuthentication,
        userProfile: sessionInfo.data?.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
