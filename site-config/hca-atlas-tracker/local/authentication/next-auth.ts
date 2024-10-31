import { NextAuthOptions } from "next-auth";
import AzureAdProvider from "next-auth/providers/azure-ad";
import GoogleProvider from "next-auth/providers/google";
import { SESSION_MAX_AGE } from "./constants";

export const nextAuthOptions: NextAuthOptions = {
  debug: false,
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
    AzureAdProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  session: {
    maxAge: SESSION_MAX_AGE / 1000,
  },
};
