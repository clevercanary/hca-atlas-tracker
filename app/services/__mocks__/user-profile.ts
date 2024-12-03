import { GoogleProfile } from "@databiosphere/findable-ui/lib/providers/authentication/googleSignIn/profile/types";
import { TEST_USERS } from "testing/constants";

// TODO(cc) - Can we delete this?

export async function getProvidedUserProfile(
  authorization: string | undefined
): Promise<GoogleProfile | null> {
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
