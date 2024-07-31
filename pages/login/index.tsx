import { GetServerSideProps } from "next";
import { getProviders } from "next-auth/react";
import { NextAuthProviders } from "../../app/components/Login/common/entities";
import { LoginView } from "../../app/views/LoginView/loginView";

interface LoginPageProps {
  providers: NextAuthProviders | null;
}

export const getServerSideProps: GetServerSideProps<
  LoginPageProps
> = async () => {
  return {
    props: { pageTitle: "Login", providers: await getProviders() },
  };
};

/**
 * Login page.
 * @param props - Page props.
 * @param props.providers - NextAuth providers.
 * @returns Login page view.
 */
const LoginPage = ({ providers }: LoginPageProps): JSX.Element => {
  return <LoginView providers={providers}></LoginView>;
};

export default LoginPage;
