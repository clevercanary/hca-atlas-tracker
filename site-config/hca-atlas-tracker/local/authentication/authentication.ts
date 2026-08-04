import * as MDX from "@/app/components/common/MDXContent";
import { type AuthenticationConfig } from "@databiosphere/findable-ui/lib/config/entities";

export const authenticationConfig: AuthenticationConfig = {
  termsOfService: MDX.LoginTermsOfService({}),
  text: "Please sign in to access the Atlas Tracker",
  title: "Sign in",
};
