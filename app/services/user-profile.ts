import { getConfig } from "@databiosphere/findable-ui/lib/config/config";
import { getAuthenticationRequestOptions } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/common/utils";
import { UserProfile } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useFetchGoogleProfile";
import ky from "ky";

const userProfilesCache = new Map<string, UserProfile>();

export async function getProvidedUserProfile(
  authorization: string | undefined
): Promise<UserProfile | null> {
  if (!authorization) return null;
  const token = /^Bearer (.+)$/.exec(authorization)?.[1];
  if (!token) return null;
  let profileInfo = userProfilesCache.get(token);
  if (!profileInfo) {
    const authenticationConfig = getConfig().authentication;
    const endpoint =
      authenticationConfig?.googleGISAuthConfig?.googleProfileEndpoint;
    if (!endpoint) throw new Error("Missing Google profile endpoint");
    profileInfo = (await (
      await ky(endpoint, getAuthenticationRequestOptions(token))
    ).json()) as UserProfile;
    userProfilesCache.set(token, profileInfo);
  }
  return profileInfo;
}
