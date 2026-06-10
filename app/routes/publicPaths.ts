import { ROUTE } from "./constants";

/**
 * Paths reachable without an authenticated session.
 *
 * Used by:
 * - `proxy.ts` to skip the NextAuth auth redirect for these paths.
 * - `pages/_app.tsx` to suppress the post-logout navigation on public pages
 *   (session simply clears in place instead of redirecting to `/`).
 */
export const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  ROUTE.ACCOUNT_DISABLED,
  ROUTE.LANDING,
  ROUTE.REQUESTING_ELEVATED_PERMISSIONS,
  ROUTE.VALIDATING_ATLAS_SOURCE_STUDY_LIST,
]);
