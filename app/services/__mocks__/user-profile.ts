import { UserProfile } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useFetchGoogleProfile";
import { TEST_USERS } from "testing/constants";

export async function getProvidedUserProfile(
  authorization: string | undefined
): Promise<UserProfile | null> {
  if (!authorization) return null;
  const token = /^Bearer (.+)$/.exec(authorization)?.[1];
  if (!token) return null;
  const user = TEST_USERS.find((u) => u.token === token);
  if (!user) throw new Error("Invalid token");
  return {
    email: user.email,
    email_verified: true,
    family_name: user.name,
    given_name: user.name,
    hd: "",
    locale: "",
    name: user.name,
    picture: "",
    sub: "",
  };
}
