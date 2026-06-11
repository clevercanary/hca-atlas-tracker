import { withAuth } from "next-auth/middleware";
import { PUBLIC_PATHS } from "./app/routes/publicPaths";

// Build-output gotcha: in Next 16 the `proxy.ts` convention compiles to a
// NODEJS-runtime function registered in
// `.next/server/functions-config-manifest.json` (key `/_middleware`) — the
// legacy `.next/server/middleware-manifest.json` stays EMPTY. The gate is
// active in production builds despite that empty legacy manifest; don't
// "verify" middleware presence by reading the legacy file.
//
// NOTE: `withAuth` validates the session JWT with `process.env.NEXTAUTH_SECRET`.
// Unlike the NextAuth API route, it has NO dev fallback secret — if the env var
// is missing (or differs from what the API route uses), every token check
// fails and login loops back here forever. The secret is therefore required at
// runtime in `site-config/hca-atlas-tracker/local/authentication/next-auth-config.ts`,
// and deployed environments must set NEXTAUTH_SECRET in their task environment.

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) =>
      PUBLIC_PATHS.has(req.nextUrl.pathname) || !!token,
  },
  pages: {
    signIn: "/",
  },
});

export const config = {
  // Exclude API routes, all Next internals (including `_next/data` page-data
  // prefetches — without this, soft-nav prefetches can 307 to `/` on session
  // expiry and produce a flicker), and any path containing a file extension
  // (static assets served from /public — fonts, images, etc.).
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
