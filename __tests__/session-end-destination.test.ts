// The site config reaches an `.mdx` file jest has no transform for, via the
// login terms of service. The copy is irrelevant here; only the route is.
jest.mock("@/app/components/common/MDXContent", () => ({
  LoginTermsOfService: (): null => null,
}));

import { ROUTE } from "@/app/routes/constants";
import { PUBLIC_PATHS } from "@/app/routes/publicPaths";
import config from "@/site-config/hca-atlas-tracker/local/config";

/**
 * Guards for issue #1557: several places send a user to the app root, and they
 * have to agree.
 *
 * `app/hooks/UseSessionEndRedirect` (passive expiry), `useLogoutCallbackUrl`
 * (deliberate logout) and `proxy.ts` (`pages.signIn`) all name `ROUTE.LANDING`
 * directly, so they move together by construction and need no test. The one
 * that cannot is findable-ui's 1-hour idle timer: it builds its destination
 * from the config's `redirectRootToPath` inside `useSessionCallbackUrl`, code
 * this repo does not own. These tests hold that config value to the same
 * constant, so pointing it elsewhere fails loudly instead of silently splitting
 * the idle-timer path from every other one.
 *
 * `dev` and `prod` both build from `local`'s `makeConfig`, so asserting against
 * `local` covers all three environments.
 */
describe("session-end destination", () => {
  it("config sends the app root to the same constant the redirects name", () => {
    expect(config.redirectRootToPath).toEqual(ROUTE.LANDING);
  });

  it("is a public path, so arriving there cannot bounce the user again", () => {
    // The auth gate must let the destination through. If it did not, a session
    // end would land somewhere that redirects straight back out.
    expect(PUBLIC_PATHS.has(ROUTE.LANDING)).toBe(true);
  });
});
