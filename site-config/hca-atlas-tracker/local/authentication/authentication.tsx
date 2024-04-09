import { AuthenticationConfig } from "@clevercanary/data-explorer-ui/lib/config/entities";
import * as MDX from "../../../../app/components/common/MDXContent";

export const authenticationConfig: AuthenticationConfig = {
  googleGISAuthConfig: {
    clientId:
      "602867726547-8fggua16ofh4inipdvgnil9brmt3c75b.apps.googleusercontent.com",
    googleProfileEndpoint: "https://www.googleapis.com/oauth2/v3/userinfo",
    scope:
      "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
  },
  termsOfService: MDX.LoginTermsOfService({}),
  text: MDX.LoginText({}),
  title: "Sign in to your account",
};
