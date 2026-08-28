import { ROUTE } from "@/app/routes/constants";
import { PUBLIC_PATHS } from "@/app/routes/publicPaths";
import { AUTH_STATUS } from "@databiosphere/findable-ui/lib/auth/types/auth";
import { type Navigation } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/common/entities";
import { type LogoProps } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/components/Content/components/Logo/logo";
import { type HeaderProps } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header";
import { cloneElement, isValidElement, type ReactNode } from "react";

/**
 * Returns the props for the stripped-down header rendered on logged-out pages.
 *
 * This rebuilds `HeaderProps` rather than adapting it, so every field is either
 * named below or dropped. That is deliberate — a logged-out visitor should be
 * shown only what we have decided to show them — but it means the list has to
 * be read as a decision, not as an inventory. Kept:
 *
 * - `logo` — re-pointed at the landing page (see `getLandingLogo`).
 * - `navigation` — slot 2 only (Help & Documentation); the main app nav goes.
 * - `authenticationEnabled` — the Sign In button is the point of this header.
 * - `announcements` — the landing page is the only page a session end ever
 *   lands on, so dropping it made the inactivity banner unreachable in
 *   practice. That bug is why this list is now written out.
 *
 * Dropped, none of which our site config currently sets, so each is a latent
 * decision rather than a live one: `actions`, `className`, `searchEnabled`,
 * `searchURL`, `slogan`, `socialMedia`.
 *
 * A field added to `HeaderProps` upstream, or newly set in site config, is
 * dropped here by default and will render on the app header while silently
 * vanishing on the landing page — exactly how `announcements` went missing. If
 * that default stops being what we want, spreading `header` and overriding
 * `logo`/`navigation` inverts it. See #1556.
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
    announcements: header?.announcements,
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
