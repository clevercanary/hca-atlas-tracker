import { useRouter } from "next/router";
import { normalizePagePath } from "./utils";

/**
 * Current page pathname in canonical form — query string, fragment, and
 * trailing slash stripped. Used as the key for any page-scoped state lookups
 * that need to align with how other systems (e.g. middleware) key against the
 * concrete URL path.
 * @returns Canonical pathname.
 */
export const useCurrentPath = (): string => {
  const { asPath } = useRouter();
  return normalizePagePath(asPath);
};
