import { AuthenticationConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { GOOGLE_SIGN_IN_PROVIDER } from "@databiosphere/findable-ui/lib/providers/googleSignInAuthentication/service/constants";
import * as MDX from "../../../../app/components/common/MDXContent";
import { OAUTH_GOOGLE_SIGN_IN } from "../../../common/authentication";

const CLIENT_ID =
  "602867726547-8fggua16ofh4inipdvgnil9brmt3c75b.apps.googleusercontent.com";

export const authenticationConfig: AuthenticationConfig = {
  providers: [
    {
      ...GOOGLE_SIGN_IN_PROVIDER,
      ...OAUTH_GOOGLE_SIGN_IN,
      clientId: CLIENT_ID,
    },
  ],
  termsOfService: MDX.LoginTermsOfService({}),
  text: MDX.LoginText({}),
  title: "Sign in to your account",
};
