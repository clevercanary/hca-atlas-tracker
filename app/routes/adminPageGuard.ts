import { GetServerSidePropsContext, Redirect } from "next";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "../../site-config/hca-atlas-tracker/local/authentication/next-auth-config";
import { ROLE } from "../apis/catalog/hca-atlas-tracker/common/entities";
import { ROUTE } from "./constants";

/**
 * Server-side admin guard for admin-only pages. Returns a redirect to the
 * atlases list when the session user is not a CONTENT_ADMIN, or null when the
 * request is allowed.
 *
 * Complements the middleware (proxy.ts) role gate: the middleware matcher
 * excludes `_next`, so a client-side (`_next/data`) navigation to an admin
 * page bypasses it — but that navigation still runs `getServerSideProps`, so
 * this guard closes that gap.
 * @param context - getServerSideProps context.
 * @returns A redirect descriptor for non-admins, or null when allowed.
 */
export async function getAdminPageRedirect(
  context: GetServerSidePropsContext,
): Promise<{ redirect: Redirect } | null> {
  const session = await getServerSession(
    context.req,
    context.res,
    nextAuthOptions,
  );
  if (session?.user?.role !== ROLE.CONTENT_ADMIN) {
    return { redirect: { destination: ROUTE.ATLASES, permanent: false } };
  }
  return null;
}
