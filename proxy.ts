import { withAuth } from "next-auth/middleware";
import { isRequestAuthorized } from "./app/routes/authorization";

// Build-output gotcha: in Next 16 the `proxy.ts` convention compiles to a
// NODEJS-runtime function registered in
// `.next/server/functions-config-manifest.json` (key `/_middleware`) — the
// legacy `.next/server/middleware-manifest.json` stays EMPTY. The gate is
// active in production builds despite that empty legacy manifest; don't
// "verify" middleware presence by reading the legacy file.
//
// `withAuth` reads the session JWT from the `next-auth.session-token` cookie
// (`__Secure-`-prefixed under HTTPS) and validates it with
// `process.env.NEXTAUTH_SECRET`. Unlike the NextAuth API route it has NO dev
// fallback secret, so NEXTAUTH_SECRET must be set wherever this runs — locally
// via `site-config/hca-atlas-tracker/local/.env`, and in every deployed task
// environment.
//
// DEBUGGING A LOGIN LOOP (lands back on `/` while `/api/auth/session` shows the
// user as signed in): the cause is almost never the secret — it's that the
// session cookie never reaches this middleware. `withAuth` redirects to the
// sign-in page whenever `getToken` returns null, which happens if the cookie
// isn't on the request at all. The classic deployed cause is the CDN in front
// of the origin stripping cookies: CloudFront's default cache behavior was set
// to `cookies { forward = "none" }` (and cached HTML), so the origin saw every
// page / `_next/data` / middleware request as anonymous while `/api/*` — which
// did forward cookies — kept reporting a valid session. The fix lives in the
// infra, not here: the CDN must forward the session cookie to the origin for
// all non-API routes and not cache gated responses. See
// clevercanary/hca-atlas-tracker-tf-config#65.

// Role-based gate: public paths are open, any other path needs a valid
// session, and admin-only paths (see `ADMIN_PATHS`) additionally require the
// CONTENT_ADMIN role. When this returns false, `withAuth` redirects to
// `pages.signIn` ("/") with a `callbackUrl` — for an authenticated non-admin
// that bounces on to /atlases, the same UX as the unauthenticated case.
export default withAuth({
  callbacks: {
    authorized: ({ req, token }) =>
      isRequestAuthorized(req.nextUrl.pathname, token?.role, !!token),
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
