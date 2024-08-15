import { AuthenticationMenu } from "@databiosphere/findable-ui/lib/components/LAyout/components/Header/components/Content/components/Actions/components/Authentication/components/AuthenticationMenu/authenticationMenu";
import { RequestAuthentication } from "@databiosphere/findable-ui/lib/components/LAyout/components/Header/components/Content/components/Actions/components/Authentication/components/RequestAuthentication/requestAuthentication";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useAuthentication } from "../../../../../../../../../../hooks/useAuthentication/useAuthentication";

export interface AuthenticationProps {
  authenticationEnabled?: boolean;
  closeMenu: () => void;
}

export const Authentication = ({
  authenticationEnabled,
  closeMenu,
}: AuthenticationProps): JSX.Element => {
  const { isAuthenticated, requestAuthentication, userProfile } =
    useAuthentication();
  const router = useRouter();
  const onLogout = useCallback((): void => {
    signOut({ callbackUrl: window.location.origin + router.basePath });
  }, [router]);
  return (
    <>
      {authenticationEnabled &&
        (isAuthenticated && userProfile ? (
          <AuthenticationMenu
            onLogout={onLogout}
            userProfile={{
              name: userProfile.name ?? "",
              picture: userProfile.image ?? "",
            }}
          />
        ) : (
          <RequestAuthentication
            closeMenu={closeMenu}
            requestAuthorization={requestAuthentication}
          />
        ))}
    </>
  );
};
