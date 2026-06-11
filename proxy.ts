import { withAuth } from "next-auth/middleware";
import { PUBLIC_PATHS } from "./app/routes/publicPaths";

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
