import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { Header } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type JSX } from "react";
import { type Props } from "./entities";
import {
  getLandingHeaderProps,
  getRoleHeaderProps,
  shouldRenderAppHeader,
} from "./utils";

/**
 * Renders the app header component based on the provided header props and authentication state.
 * The role is read from the NextAuth session rather than `useAuthorization`, because the header
 * renders outside `AuthorizationProvider`; it is also the role the auth middleware checks.
 * @param props - Component props.
 * @param props.header - Header props.
 * @returns The app header component or null if no header props are provided.
 */
export const AppHeader = ({ header }: Props): JSX.Element | null => {
  const {
    authState: { isAuthenticated, status },
  } = useAuth();
  const { data: session } = useSession();
  const { pathname } = useRouter();

  if (!header) return null;

  const headerProps = shouldRenderAppHeader(status, isAuthenticated, pathname)
    ? getRoleHeaderProps(header, session?.user?.role)
    : getLandingHeaderProps(header);

  return <Header {...headerProps} />;
};
