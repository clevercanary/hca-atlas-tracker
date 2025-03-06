import { AuthenticationConfig } from "@databiosphere/findable-ui/lib/config/entities";
import * as MDX from "../../../../app/components/common/MDXContent";

export const authenticationConfig: AuthenticationConfig = {
  termsOfService: MDX.LoginTermsOfService({}),
  text: MDX.LoginText({}),
  title: "Sign in to your account",
};
