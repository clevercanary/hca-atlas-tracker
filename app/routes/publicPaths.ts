import { ROUTE } from "./constants";

/**
 * Paths reachable without an authenticated session.
 *
 * Entries MUST be static, concrete pathnames (no dynamic segments). Consumers
 * match against different path representations — `middleware.ts` checks the
 * concrete `req.nextUrl.pathname`, `shouldRenderAppHeader` checks the
 * pages-router template `router.pathname`, and `useLogoutCallbackUrl` checks
 * the normalized `router.asPath` — and these only agree for static routes.
 * A dynamic route added here would silently diverge across them.
 *
 * Used by:
 * - `middleware.ts` to skip the NextAuth auth redirect for these paths.
 * - `app/hooks/UseLogoutCallbackUrl` (consumed in `pages/_app.tsx`) to
 *   suppress the post-logout navigation on public pages (session simply
 *   clears in place instead of redirecting to `/`).
 * - `app/components/Layout/components/Header/utils.ts` to pick the header
 *   variant while auth state is still resolving.
 */
export const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  ROUTE.ACCOUNT_DISABLED,
  ROUTE.LANDING,
  ROUTE.REQUESTING_ELEVATED_PERMISSIONS,
  ROUTE.VALIDATING_ATLAS_SOURCE_STUDY_LIST,
]);
