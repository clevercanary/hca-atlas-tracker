import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { ClientSafeProvider, getProviders } from "next-auth/react";
import { JSX } from "react";
import { ROUTE } from "../app/routes/constants";
import { HomeView } from "../app/views/HomeView/homeView";
import { nextAuthOptions } from "../site-config/hca-atlas-tracker/local/authentication/next-auth-config";

interface Props {
  providers: ClientSafeProvider[];
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
}) => {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (session) {
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

const HomePage = ({ providers }: Props): JSX.Element => {
  return <HomeView providers={providers} />;
};

export default HomePage;
