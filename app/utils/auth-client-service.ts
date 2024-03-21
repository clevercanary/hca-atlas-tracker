import { OAuth2Client, TokenInfo } from "google-auth-library";

export interface AuthClient {
  getTokenInfo(token: string): Promise<TokenInfo>;
}

export function getAuthClient(): AuthClient {
  if (process.env.NODE_ENV === "test") {
    return getTestAuthClient();
  } else {
    return new OAuth2Client();
  }
}

function getTestAuthClient(): AuthClient {
  return {
    async getTokenInfo(): Promise<TokenInfo> {
      return {
        aud: "",
        email: "test@example.com",
        email_verified: true,
        expiry_date: -1,
        scopes: [],
      };
    },
  };
}
