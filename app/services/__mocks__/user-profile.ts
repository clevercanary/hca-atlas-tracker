import { TEST_USERS } from "testing/constants";
import { UserProfile } from "../user-profile";

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
    name: user.name,
  };
}
