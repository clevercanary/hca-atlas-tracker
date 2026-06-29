import { GetServerSidePropsContext, Redirect } from "next";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "../../site-config/hca-atlas-tracker/local/authentication/next-auth-config";
import { ROLE } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { ROUTE } from "./constants";

/**
 * Server-side admin guard for admin-only pages. Returns null when the request
 * is allowed (session user is a CONTENT_ADMIN), otherwise a redirect:
 * unauthenticated requests go to the sign-in page with a `callbackUrl` back to
 * the requested URL (mirroring the middleware's unauthenticated behavior),
 * while authenticated non-admins go to the atlases list.
 *
 * Complements the middleware (proxy.ts) role gate: the middleware matcher
 * excludes `_next`, so a client-side (`_next/data`) navigation to an admin
 * page bypasses it — but that navigation still runs `getServerSideProps`, so
 * this guard closes that gap.
 * @param context - getServerSideProps context.
 * @returns A redirect descriptor when not allowed, or null when allowed.
 */
export async function getAdminPageRedirect(
  context: GetServerSidePropsContext,
): Promise<{ redirect: Redirect } | null> {
  const session = await getServerSession(
    context.req,
    context.res,
    nextAuthOptions,
  );
  if (!session) {
    const callbackUrl = encodeURIComponent(context.resolvedUrl);
    return {
      redirect: {
        destination: `${ROUTE.LANDING}?callbackUrl=${callbackUrl}`,
        permanent: false,
      },
    };
  }
  if (session.user?.role !== ROLE.CONTENT_ADMIN) {
    return { redirect: { destination: ROUTE.ATLASES, permanent: false } };
  }
  return null;
}
