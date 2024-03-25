import { OAuth2Client, TokenInfo } from "google-auth-library";
import { TEST_USERS } from "testing/constants";

type AuthClient = Pick<OAuth2Client, "getTokenInfo">;

const googleAuthLibrary = jest.createMockFromModule("google-auth-library") as {
  OAuth2Client: () => AuthClient;
};

googleAuthLibrary.OAuth2Client = function (): AuthClient {
  return {
    async getTokenInfo(token): Promise<TokenInfo> {
      const user = TEST_USERS.find((u) => u.token === token);
      if (!user) throw new Error("Invalid token");
      return {
        aud: "",
        email: user.email,
        email_verified: true,
        expiry_date: -1,
        scopes: [],
      };
    },
  };
};

module.exports = googleAuthLibrary;
