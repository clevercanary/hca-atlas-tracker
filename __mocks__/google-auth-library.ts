import { OAuth2Client, TokenInfo } from "google-auth-library";

type AuthClient = Pick<OAuth2Client, "getTokenInfo">;

const googleAuthLibrary = jest.createMockFromModule("google-auth-library") as {
  OAuth2Client: () => AuthClient;
};

googleAuthLibrary.OAuth2Client = function (): AuthClient {
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
};

module.exports = googleAuthLibrary;
