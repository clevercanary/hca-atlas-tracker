import { ROLE } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { ROUTE } from "./constants";
import { PUBLIC_PATHS } from "./publicPaths";

// Paths only a CONTENT_ADMIN may load. Enforced by the auth middleware
// (proxy.ts) before the page renders — defence in depth alongside the
// API-layer `role()` guards, not a replacement.
//
// Resource-scoped paths (e.g. source-study creation, allowed for an
// integration lead on their own atlas) are intentionally NOT listed: the JWT
// carries the user's role but not their associated atlas IDs, so the
// ownership part can't be checked here. Those keep their client-side and
// API-layer checks.
//
// Matched as path prefixes (exact, or followed by `/`) rather than regexes so
// dynamic ROUTE templates (e.g. `[atlasId]`) can't be silently misinterpreted
// as regex syntax. These three are static; add new entries from ROUTE.
export const ADMIN_PATHS: readonly string[] = [
  ROUTE.CREATE_ATLAS,
  ROUTE.CREATE_USER,
  ROUTE.FILES_ADMIN,
];

/**
 * Whether a pathname is restricted to CONTENT_ADMIN users.
 * @param pathname - Request pathname.
 * @returns True when the path is admin-only.
 */
export function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some(
    (adminPath) =>
      pathname === adminPath || pathname.startsWith(`${adminPath}/`),
  );
}

/**
 * Authorization decision for the auth middleware: whether a request to the
 * given path is allowed for the given role and authentication state. Public
 * paths are always allowed; otherwise a valid session is required, and
 * admin-only paths additionally require the CONTENT_ADMIN role.
 * @param pathname - Request pathname.
 * @param role - Role from the NextAuth JWT, if any.
 * @param isAuthenticated - Whether the request carries a valid session token.
 * @returns True when the request is authorized.
 */
export function isRequestAuthorized(
  pathname: string,
  role: ROLE | undefined,
  isAuthenticated: boolean,
): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (!isAuthenticated) return false;
  if (isAdminPath(pathname)) return role === ROLE.CONTENT_ADMIN;
  return true;
}
