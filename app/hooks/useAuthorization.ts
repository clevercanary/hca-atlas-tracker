import { useContext } from "react";
import {
  AuthorizationContext,
  AuthorizationContextProps,
} from "../providers/authorization";

export const useAuthorization = (): AuthorizationContextProps => {
  return useContext(AuthorizationContext);
};
