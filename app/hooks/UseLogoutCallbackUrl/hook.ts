import { ROUTE } from "../../routes/constants";
import { PUBLIC_PATHS } from "../../routes/publicPaths";
import { useCurrentPath } from "../UseCurrentPath/hook";

/**
 * Returns the `logoutCallbackUrl` to pass to `NextAuthAuthenticationProvider`.
 *
 * On a protected page, logout must navigate so middleware can re-run and the
 * user is bounced to the landing. On a public page, the user can stay where
 * they are — return `undefined` so `signOut` clears the session in place.
 *
 * Uses the canonical pathname (via `useCurrentPath`) so this hook agrees with
 * `proxy.ts`, which keys `PUBLIC_PATHS` against `req.nextUrl.pathname`.
 *
 * @returns The post-logout callbackUrl, or `undefined` on a public path.
 */
export const useLogoutCallbackUrl = (): string | undefined => {
  const pathname = useCurrentPath();
  return PUBLIC_PATHS.has(pathname) ? undefined : ROUTE.LANDING;
};
