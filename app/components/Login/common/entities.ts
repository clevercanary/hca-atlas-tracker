import { BuiltInProviderType } from "next-auth/providers";
import { ClientSafeProvider, LiteralUnion } from "next-auth/react";

export type NextAuthProviders = Record<
  LiteralUnion<BuiltInProviderType>,
  ClientSafeProvider
>;
