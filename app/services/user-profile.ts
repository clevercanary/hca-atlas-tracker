import { getAuthenticationRequestOptions } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/common/utils";
import { UserProfile } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useFetchGoogleProfile";
import ky from "ky";

const ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

const userProfilesCache = new Map<string, UserProfile>();

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
