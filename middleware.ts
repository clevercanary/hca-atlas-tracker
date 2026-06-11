import { withAuth } from "next-auth/middleware";
import { PUBLIC_PATHS } from "./app/routes/publicPaths";

// This file deliberately uses the deprecated `middleware.ts` convention. Next
// 16.2 warns to rename it to `proxy.ts`, but the webpack production build
// silently EXCLUDES `proxy.ts` (middleware-manifest.json comes out empty — no
// auth gate in deployed builds) while `next dev` honors it. Keep
// `middleware.ts` (and tolerate the dev warning) until `next build` provably
// bundles `proxy.ts`: after renaming, check `.next/server/middleware-manifest.json`
// has a non-empty `middleware` entry.
//
// NOTE: `withAuth` validates the session JWT with `process.env.NEXTAUTH_SECRET`.
// Unlike the NextAuth API route, it has NO dev fallback secret — if the env var
// is missing, every token check fails and login loops back here forever. The
// secret is therefore required at runtime in
// `site-config/hca-atlas-tracker/local/authentication/next-auth-config.ts`.

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
