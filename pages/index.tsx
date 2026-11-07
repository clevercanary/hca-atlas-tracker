import { useClearSessionEndParam } from "@/app/hooks/UseClearSessionEndParam/hook";
import { ROUTE, SESSION_END_PARAM } from "@/app/routes/constants";
import { HomeView } from "@/app/views/HomeView/homeView";
import { nextAuthOptions } from "@/site-config/hca-atlas-tracker/local/authentication/next-auth-config";
import { INACTIVITY_PARAM } from "@databiosphere/findable-ui/lib/hooks/authentication/session/useSessionTimeout";
import { type GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { type ClientSafeProvider, getProviders } from "next-auth/react";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

interface Props {
  providers: ClientSafeProvider[];
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
  req,
  res,
}) => {
  // A session-end recovery renders here even with a session cookie, so the
  // session is not read at all. The cookie can be valid while the client's
  // session read says otherwise (a CDN forwarding it to pages but not to
  // `/api`), and redirecting to `/atlases` would strand the tab again and loop.
  // See `useSessionEndRedirect`.
  if (
    !isSessionEndLanding(query) &&
    (await getServerSession(req, res, nextAuthOptions))
  ) {
    return { redirect: { destination: ROUTE.ATLASES, permanent: false } };
  }

  const providers = await getProviders();

  return {
    props: {
      pageTitle: "HCA Atlas Tracker",
      providers: Object.values(providers ?? {}),
    },
  };
};

/**
 * Returns true if this load is the landing for a session that ended, marked by
 * the inactivity param or `SESSION_END_PARAM`.
 * @param query - Request query.
 * @returns true if the load carries a session-end param.
 */
function isSessionEndLanding(query: ParsedUrlQuery): boolean {
  return (
    query[INACTIVITY_PARAM] !== undefined ||
    query[SESSION_END_PARAM] !== undefined
  );
}

const HomePage = ({ providers }: Props): JSX.Element => {
  useClearSessionEndParam();
  return <HomeView providers={providers} />;
};

export default HomePage;
