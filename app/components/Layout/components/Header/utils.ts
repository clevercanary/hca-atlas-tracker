import { ROUTE } from "@/app/routes/constants";
import { PUBLIC_PATHS } from "@/app/routes/publicPaths";
import { AUTH_STATUS } from "@databiosphere/findable-ui/lib/auth/types/auth";
import { type Navigation } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/common/entities";
import { type LogoProps } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/components/Content/components/Logo/logo";
import { type HeaderProps } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header";
import { cloneElement, isValidElement, type ReactNode } from "react";

export const LANDING_HEADER_FIELD = {
  DROPPED: "DROPPED",
  KEPT: "KEPT",
} as const;

export type LandingHeaderField =
  (typeof LANDING_HEADER_FIELD)[keyof typeof LANDING_HEADER_FIELD];

/**
 * Whether each `HeaderProps` field reaches the stripped-down header rendered on
 * logged-out pages.
 *
 * `getLandingHeaderProps` rebuilds `HeaderProps` by naming the fields to keep,
 * so anything unnamed is dropped by omission — which is how the inactivity
 * banner became unreachable in #1544: `announcements` never failed, it was
 * simply never copied, and nothing surfaced that.
 *
 * Typing this as `Record<keyof HeaderProps, ...>` is what stops that recurring.
 * A field added to `HeaderProps` upstream leaves this map missing a key, which
 * fails to compile *here* — so the keep/drop call has to be made rather than
 * defaulted into. `landing-header-props` then asserts the function agrees with
 * this map, so classifying a field `KEPT` without adding it to the returned
 * object fails the suite.
 *
 * Reasons for the kept four:
 *
 * - `logo` — re-pointed at the landing page (see `getLandingLogo`).
 * - `navigation` — slot 2 only (Help & Documentation); the main app nav goes.
 * - `authenticationEnabled` — the Sign In button is the point of this header.
 * - `announcements` — the landing page is the only page a session end ever
 *   lands on, so dropping it is what made the banner unreachable.
 *
 * The six dropped are latent rather than live decisions: our site config sets
 * none of them today. If deny-by-default ever stops being what we want,
 * spreading `header` and overriding `logo`/`navigation` inverts it.
 */
export const LANDING_HEADER_FIELDS: Record<
  keyof HeaderProps,
  LandingHeaderField
> = {
  actions: LANDING_HEADER_FIELD.DROPPED,
  announcements: LANDING_HEADER_FIELD.KEPT,
  authenticationEnabled: LANDING_HEADER_FIELD.KEPT,
  className: LANDING_HEADER_FIELD.DROPPED,
  logo: LANDING_HEADER_FIELD.KEPT,
  navigation: LANDING_HEADER_FIELD.KEPT,
  searchEnabled: LANDING_HEADER_FIELD.DROPPED,
  searchURL: LANDING_HEADER_FIELD.DROPPED,
  slogan: LANDING_HEADER_FIELD.DROPPED,
  socialMedia: LANDING_HEADER_FIELD.DROPPED,
};

/**
 * Returns the props for the stripped-down header rendered on logged-out pages.
 *
 * Which fields survive, and why, is declared in `LANDING_HEADER_FIELDS`; this
 * function is the implementation of that decision and is pinned against it by
 * `landing-header-props`.
 * @param header - The full app header config (optional; the sole caller guards
 * on it, so the undefined path is defensive rather than live).
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
