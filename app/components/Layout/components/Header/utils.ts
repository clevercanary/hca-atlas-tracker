import { AUTH_STATUS } from "@databiosphere/findable-ui/lib/auth/types/auth";
import { Navigation } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/common/entities";
import { LogoProps } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/components/Content/components/Logo/logo";
import { HeaderProps } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header";
import { cloneElement, isValidElement, ReactNode } from "react";
import { ROUTE } from "../../../../routes/constants";
import { PUBLIC_PATHS } from "../../../../routes/publicPaths";

/**
 * Returns the props for the stripped-down header rendered on logged-out
 * pages: keep the logo and the Help & Documentation menu (navigation slot 2),
 * drop the main app nav.
 * @param header - The full app header config (may be undefined).
 * @returns Header props to spread onto the `DXHeader`.
 */
export function getLandingHeaderProps(
  header: HeaderProps | undefined,
): HeaderProps {
  const helpAndDocs = header?.navigation?.[2];
  const navigation: Navigation | undefined = helpAndDocs
    ? [undefined, undefined, helpAndDocs]
    : undefined;
  return {
    authenticationEnabled: header?.authenticationEnabled,
    logo: getLandingLogo(header?.logo),
    navigation,
  };
}

/**
 * Returns the logo for the logged-out landing header, re-pointed at the
 * landing page. The configured app-header logo links to the atlas list
 * (only authenticated users see the full header); logged-out visitors should
 * stay on `/` rather than bounce off the auth middleware.
 * @param logo - The configured app-header logo node.
 * @returns The logo linking to the landing page.
 */
function getLandingLogo(logo: ReactNode): ReactNode {
  if (!isValidElement<LogoProps>(logo)) return logo;
  return cloneElement(logo, { link: ROUTE.LANDING });
}

/**
 * Returns true if the full app header should be rendered (as opposed to the
 * stripped-down landing header).
 *
 * While the session is still resolving, the auth state can't distinguish a
 * pending authenticated user from a logged-out visitor — keying the switch
 * off `isAuthenticated` alone would flash the landing header at authenticated
 * users on first load (the header counterpart of #1358). Instead, infer from
 * the route during the pending window: middleware guarantees non-public paths
 * are only reachable with a session, and the landing redirects authenticated
 * users away server-side, so the route predicts the settled outcome for both
 * cohorts and neither sees a header swap.
 * @param status - Auth status (pending until the session has settled).
 * @param isAuthenticated - User's authentication status.
 * @param pathname - Current route pathname.
 * @returns true if the full app header should be rendered.
 */
export function shouldRenderAppHeader(
  status: AUTH_STATUS,
  isAuthenticated: boolean,
  pathname: string,
): boolean {
  if (status !== AUTH_STATUS.SETTLED) return !PUBLIC_PATHS.has(pathname);
  return isAuthenticated;
}
