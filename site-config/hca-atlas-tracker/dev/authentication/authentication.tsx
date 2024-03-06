import { AuthenticationConfig } from "@clevercanary/data-explorer-ui/lib/config/entities";
import {
  LoginTermsOfService,
  LoginText,
} from "../../../../app/components/common/MDXContent";

export function getAuthenticationConfig(
  portalURL: string
): AuthenticationConfig {
  return {
    googleGISAuthConfig: {
      clientId:
        "602867726547-8fggua16ofh4inipdvgnil9brmt3c75b.apps.googleusercontent.com",
      googleProfileEndpoint: "https://www.googleapis.com/oauth2/v3/userinfo",
      scope:
        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
    },
    termsOfService: <LoginTermsOfService portalURL={portalURL} />,
    text: <LoginText />,
    title: "Sign in to your account",
  };
}
