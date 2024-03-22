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
    async getTokenInfo(token): Promise<TokenInfo> {
      return {
        aud: "",
        email:
          token === "a"
            ? "a@example.com"
            : token === "b"
            ? "b@example.com"
            : "test@example.com",
        email_verified: true,
        expiry_date: -1,
        scopes: [],
      };
    },
  };
}
