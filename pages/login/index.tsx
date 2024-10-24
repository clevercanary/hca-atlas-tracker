import { LoginView } from "@databiosphere/findable-ui/lib/views/LoginView/loginView";
import { GetServerSideProps } from "next";
import { ClientSafeProvider, getProviders } from "next-auth/react";

interface LoginPageProps {
  providers: ClientSafeProvider[];
}

export const getServerSideProps: GetServerSideProps<
  LoginPageProps
> = async () => {
  const providers = await getProviders();
  return {
    props: { pageTitle: "Login", providers: Object.values(providers || {}) },
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
