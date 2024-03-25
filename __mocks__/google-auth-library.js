const googleAuthLibrary = jest.createMockFromModule("google-auth-library");

googleAuthLibrary.OAuth2Client = function () {
  return {
    async getTokenInfo(token) {
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
