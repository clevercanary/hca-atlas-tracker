import {
  AuthorizationContext,
  type AuthorizationContextProps,
} from "@/app/providers/authorization";
import { useContext } from "react";

export const useAuthorization = (): AuthorizationContextProps => {
  return useContext(AuthorizationContext);
};
