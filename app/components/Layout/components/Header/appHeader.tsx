import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";
import { Header } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header";
import { useRouter } from "next/router";
import { JSX } from "react";
import { type Props } from "./entities";
import { getLandingHeaderProps, shouldRenderAppHeader } from "./utils";

/**
 * Renders the app header component based on the provided header props and authentication state.
 * @param props - Component props.
 * @param props.header - Header props.
 * @returns The app header component or null if no header props are provided.
 */
export const AppHeader = ({ header }: Props): JSX.Element | null => {
  const {
    authState: { isAuthenticated, status },
  } = useAuth();
  const { pathname } = useRouter();

  if (!header) return null;

  const headerProps = shouldRenderAppHeader(status, isAuthenticated, pathname)
    ? header
    : getLandingHeaderProps(header);

  return <Header {...headerProps} />;
};
