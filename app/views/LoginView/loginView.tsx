import { useAuthenticationConfig } from "@databiosphere/findable-ui/lib/hooks/useAuthenticationConfig";
import { NextAuthProviders } from "../../components/Login/common/entities";
import { Login } from "../../components/Login/login";

interface LoginViewProps {
  providers: NextAuthProviders | null;
}

export const LoginView = ({ providers }: LoginViewProps): JSX.Element => {
  const { termsOfService, text, title, warning } = useAuthenticationConfig();

  return (
    <Login
      providers={providers}
      termsOfService={termsOfService}
      text={text}
      title={title}
      warning={warning}
    />
  );
};
