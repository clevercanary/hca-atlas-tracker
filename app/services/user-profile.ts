import { UserProfile as BaseUserProfile } from "@databiosphere/findable-ui/lib/providers/authentication/authentication/types";
import { getAuthenticationRequestOptions } from "@databiosphere/findable-ui/lib/providers/authentication/terra/hooks/common/utils";
import ky from "ky";

const ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

const userProfilesCache = new Map<string, UserProfile>();

export type UserProfile = BaseUserProfile & { email_verified: boolean };

export async function getProvidedUserProfile(
  authorization: string | undefined
): Promise<UserProfile | null> {
  if (!authorization) return null;
  const token = /^Bearer (.+)$/.exec(authorization)?.[1];
  if (!token) return null;
  let profileInfo = userProfilesCache.get(token);
  if (!profileInfo) {
    profileInfo = (await (
      await ky(ENDPOINT, getAuthenticationRequestOptions(token))
    ).json()) as UserProfile;
    userProfilesCache.set(token, profileInfo);
  }
  return profileInfo;
}
